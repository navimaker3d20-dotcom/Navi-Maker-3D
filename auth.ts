callbacks: {
  async jwt({ token, user, trigger }) {
    // ...
    return token;
  },

  async session({ session, token }) {
    // ...
    return session;
  },
},