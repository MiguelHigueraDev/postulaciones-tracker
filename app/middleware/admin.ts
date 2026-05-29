export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  if (!user.value) {
    return navigateTo({
      path: "/admin/login",
      query: { redirect: to.fullPath },
    });
  }
});
