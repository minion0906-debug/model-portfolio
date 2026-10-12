# CRUD Upgrade

Updated Gallery and Video delete operations to use Prisma transactions and cleanup dependent records before deleting Media.

Included:
- MediaTag cleanup
- Payment cleanup
- Transaction-safe delete flow
