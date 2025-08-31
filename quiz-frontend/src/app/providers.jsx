import { createContext, useContext } from "react";
import { AuthService } from "../services/auth.service";

const ServicesContext = createContext({ auth: AuthService });
export const useServices = () => useContext(ServicesContext);

export function ServicesProvider({ children }) {
  return (
    <ServicesContext.Provider value={{ auth: AuthService }}>
      {children}
    </ServicesContext.Provider>
  );
}
