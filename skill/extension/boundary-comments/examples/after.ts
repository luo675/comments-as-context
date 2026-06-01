import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// LAYER: presentation/controller
// DEPENDS ON: application/ (service layer only)
// DEPENDENCY RULE: Must NOT import from infrastructure/ directly.
//                  Use dependency injection provided by the framework.
// CROSS-LAYER: DENIED — Controller must not access Prisma directly.
//              Should delegate to a UserService in the application layer.
export class UserController {
  async getProfile(req: { params: { id: string } }, res: { status: (code: number) => { json: (data: object) => void } }): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    const orders = await prisma.order.findMany({ where: { userId: req.params.id } });
    const totalSpent = orders.reduce((sum, o) => sum + o.totalCents, 0);
    res.status(200).json({ user, orderCount: orders.length, totalSpent });
  }
}

// LAYER: infrastructure/repository
// DEPENDS ON: domain/ entities and repository interfaces
// DEPENDENCY RULE: Must NOT depend on application/ or presentation/.
//                  Return domain entities only (not ORM models).
// CROSS-LAYER: allowed — Repository → database via ORM
export class PostgresUserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async save(user: { id: string; name: string; email: string }) {
    return prisma.user.upsert({ where: { id: user.id }, create: user, update: user });
  }
}
