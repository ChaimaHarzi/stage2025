import { registerEnumType } from '@nestjs/graphql';
import { Genre, Role, ScanSource, Status } from '@prisma/client';

registerEnumType(Role, { name: 'Role' });
registerEnumType(Genre, { name: 'Genre' });
registerEnumType(Status, {
  name: 'Status',
  description: 'STOCK = en stock, PROD = en production, REP = en réparation',
});
registerEnumType(ScanSource, { name: 'ScanSource' });

export { Genre, Role, ScanSource, Status };

/** Logique métier du rapport : 1 scan → production, 2 scans → stock, 3 scans → réparation. */
export const STATUS_PAR_NOMBRE_DE_SCANS: Record<number, Status> = {
  1: Status.PROD,
  2: Status.STOCK,
  3: Status.REP,
};
