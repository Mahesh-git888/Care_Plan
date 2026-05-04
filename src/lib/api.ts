export function getIntakeApiUrl() {
  return process.env.NEXT_PUBLIC_INTAKE_API_URL?.trim() || "/api/v1/intake";
}
