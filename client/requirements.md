## Packages
framer-motion | For smooth page transitions and component animations
recharts | For the manager dashboard analytics charts
lucide-react | For beautiful icons (already in base, but emphasizing usage)
clsx | For conditional class names (already in base)
tailwind-merge | For merging tailwind classes (already in base)

## Notes
The application uses a role-based system.
- Public pages: Home, Menu (Customer)
- Protected pages: Waiter, Kitchen, Manager, Admin
- Auth is handled via session cookies.
- Cart state for customers is local until "Place Order" is clicked.
- "Real-time" updates for Kitchen/Waiter are simulated via polling (React Query refetchInterval).
