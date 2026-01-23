import React from "react";

export const BrowserRouter = ({ children }) => <div>{children}</div>;
export const MemoryRouter = ({ children }) => <div>{children}</div>;
export const Routes = ({ children }) => <div>{children}</div>;
export const Route = ({ children }) => <div>{children}</div>;
export const Link = ({ to, children, ...props }) => (
  <a href={to} {...props}>
    {children}
  </a>
);
export const useNavigate = () => jest.fn();
export const useLocation = () => ({ pathname: "/" });
export const useParams = () => ({});
export const Navigate = ({ to }) => <div>Navigate to {to}</div>;
