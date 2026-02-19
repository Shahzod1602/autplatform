export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { prisma } = await import("@/lib/prisma");

    // Clean up unverified users every minute
    setInterval(async () => {
      try {
        const result = await prisma.user.deleteMany({
          where: {
            emailVerified: false,
            verifyTokenExpiry: {
              lt: new Date(),
            },
          },
        });
        if (result.count > 0) {
          console.log(`Cleaned up ${result.count} unverified expired users`);
        }
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    }, 60 * 1000);
  }
}
