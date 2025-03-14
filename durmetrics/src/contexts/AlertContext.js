import React, { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";

const AlertContext = createContext();

export const AlertContextProvider = ({ children }) => {
        const [alerts, setAlerts] = useState([]);

        const addAlert = (message, type) => {
                const id = Math.random();
                setAlerts((prev) => [...prev, { id, message, type }]);

                setTimeout(() => {
                        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
                }, 3000);
        };

        return (
                <AlertContext.Provider value={{
                        success: (msg) => addAlert(msg, "success"),
                        error: (msg) => addAlert(msg, "error"),
                        warning: (msg) => addAlert(msg, "warning")
                }}>
                        {children}
                        {createPortal(
                                <div className="alert-container">
                                        {alerts.map((alert) => (
                                                <div key={alert.id} className={`alert alert-${alert.type}`}>
                                                        {alert.message}
                                                </div>
                                        ))}
                                </div>,
                                document.body
                        )}
                </AlertContext.Provider>
        );
};

export const useAlert = () => useContext(AlertContext);
