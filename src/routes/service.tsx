import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/service')({ component: ServiceLayout })

function ServiceLayout() {
  return <Outlet />
}
