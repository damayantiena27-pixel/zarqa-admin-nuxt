export default defineNuxtRouteMiddleware(async () => {
  const { user, loading, initialized } = useAuth();

  // Wait for auth initialization to complete
  if (!initialized.value || loading.value) {
    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (initialized.value && !loading.value) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);

      // Timeout after 5 seconds to prevent infinite loop
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });
  }

  // After initialization, check if user exists
  if (user.value) {
    return navigateTo("/");
  }
});
