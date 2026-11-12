"use client";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "./config";

export class ApiError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
  }
}

/** Appel GraphQL brut. Lève une ApiError avec le message (en français) renvoyé par l'API. */
export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new ApiError("Le serveur est injoignable. Vérifiez que l'API est démarrée.");
  }
  const json = await res.json().catch(() => null);
  if (json?.errors?.length) {
    const err = json.errors[0];
    throw new ApiError(err.message, err.extensions?.code);
  }
  if (!res.ok || !json?.data) throw new ApiError("Une erreur est survenue, veuillez réessayer.");
  return json.data as T;
}

/** Renvoie une fonction d'appel authentifiée ; déconnecte si la session API a expiré. */
export function useApi() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  return useCallback(
    async <T,>(query: string, variables?: Record<string, unknown>) => {
      try {
        return await graphqlRequest<T>(query, variables, token);
      } catch (e) {
        if (e instanceof ApiError && e.code === "UNAUTHENTICATED") {
          await signOut({ callbackUrl: "/" });
        }
        throw e;
      }
    },
    [token],
  );
}

/** Requête chargée au montage, avec rechargement manuel (refetch). */
export function useQuery<T>(query: string, variables?: Record<string, unknown>) {
  const api = useApi();
  const { status } = useSession();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const varsKey = JSON.stringify(variables ?? {});
  const requestId = useRef(0);

  const refetch = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const result = await api<T>(query, JSON.parse(varsKey));
      if (id === requestId.current) {
        setData(result);
        setError(null);
      }
    } catch (e) {
      if (id === requestId.current) setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [api, query, varsKey]);

  useEffect(() => {
    if (status === "authenticated") refetch();
  }, [status, refetch]);

  return { data, error, loading, refetch };
}
