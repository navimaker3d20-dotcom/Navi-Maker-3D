import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/schemas/auth.schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // El adapter queda listo para agregar providers OAuth (Google, etc.) más
  // adelante. Con Credentials, la sesión igual se maneja por JWT (ver abajo),
  // no por sesiones de base de datos.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/cuenta/login",
    error: "/cuenta/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    // El rol se agrega al token la primera vez que se firma (login) y en
    // cada refresco se vuelve a leer de la base de datos, para que un
    // cambio de rol hecho desde /admin surta efecto sin esperar a que
    // expire la sesión.
    async jwt({ token, user, trigger }) {
      if (usuario) {
  token.id = usuario.id as string;
  token.role = (usuario as {
    role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
  }).role;
}

      if (trigger === "update" || !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) token.role = dbUser.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
      }
      return session;
    },
  },
});
