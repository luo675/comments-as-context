import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class UserController {
  async getProfile(req: { params: { id: string } }, res: { status: (code: number) => { json: (data: object) => void } }): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    const orders = await prisma.order.findMany({ where: { userId: req.params.id } });
    const totalSpent = orders.reduce((sum, o) => sum + o.totalCents, 0);
    res.status(200).json({ user, orderCount: orders.length, totalSpent });
  }
}

export class PostgresUserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async save(user: { id: string; name: string; email: string }) {
    return prisma.user.upsert({ where: { id: user.id }, create: user, update: user });
  }
}
