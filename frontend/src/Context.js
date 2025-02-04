import { createContext, useState } from "react";

export const AppContext = createContext();

// El nombre de AppProvides es un poco confuso, ya que despues usamos AppContext.Provider, por lo que me confunde
// sin embargo, AppProvider es un componente de react que va a actuar como el que engloba y envuelve al resto de la App,
// de manera que podamos alimentar a nuestros hijos con las variables que declaremos aqui, por lo que 'AppProvider' podria
// cambiarse por cualquier otro nombre, y el importante es AppContext, que es el que actua como el 'Provider' de las variables
// globales que estamos definiendo aqui
export const AppProvider = ({ children }) => {
  //______________________________________________________
  // ESTE ES UN EJEMPLO QUE HICE PARA ENTENDER EL COMPORTAMIENTO DE 'CREATECONTEXT'
  const [example, setExample] = useState("Hello, Context!");
  //______________________________________________________

  return (
    <AppContext.Provider value={{ example, setExample }}>
      {children}
    </AppContext.Provider>
  );
};
