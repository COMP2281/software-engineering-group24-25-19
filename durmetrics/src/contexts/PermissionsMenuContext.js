import React, { useState, createContext, useContext, useEffect } from 'react';
import Error from '../pages/Error';
import axios from 'axios';

export const PermissionsMenuContext = createContext();

export const PermissionsMenuContextProvider = (props) => {
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        const [permissionsContent, setPermissionsContent] = useState(null);
        const [menuContent, setMenuContent] = useState(
                [
                        {
                                title: 'Tables',
                                route: '/tables',
                                icon: 'tables'
                        },
                        {
                                title: 'Insights',
                                route: '/insights',
                                icon: 'insights'
                        }
                ]
        );

        const getPermissionsLevel = async () => {
                // try {
                //         const res = await axios.get("<API CALL FOR PERMISSIONS>", {
                //                 headers: {
                //                         'Content-Type': 'application/json',
                //                 },
                //                 withCredentials: true,
                //         });

                //         return res;
                // } catch (err) {
                //         setError(err.status);
                // }

                return 2; // Edit permissions
        };

        useEffect(() => {
                const fetchPermissionsAndSetMenu = async () => {
                        try {
                                const res = await getPermissionsLevel();

                                setPermissionsContent(res);

                                if (res >= 2) {
                                        setMenuContent((prevMenuContent) => [
                                                ...prevMenuContent,
                                                {
                                                        title: 'Upload',
                                                        route: '/upload',
                                                        icon: 'upload',
                                                },
                                        ]);
                                } else if (res <= 1) {
                                        // Backend routing should cover this, but just in case
                                        throw 401;
                                }
                        } catch (err) {
                                setError(err);
                        } finally {
                                setLoading(false);
                        }
                };

                fetchPermissionsAndSetMenu();
        }, []);

        useEffect(() => {
                // Check for 404 after menuContent is updated
                if (!loading && menuContent.length > 0) {
                        const pages = menuContent.map((page) => page.route);

                        if (!pages.includes(window.location.pathname) && window.location.pathname !== '/') {
                                setError(404);
                        } else if (!error) {
                                setError(null);
                        }
                }
        }, [menuContent, loading]);

        // Render loading, error, or data
        // if (loading) return <p>Loading...</p>;
        if (error) {
                switch (error) {
                        case 404:
                                return <Error
                                        code={404}
                                        title={"Page not found"}
                                        message={"The page you are looking for could not be found."} />;
                        case 401:
                                return <Error
                                        code={401}
                                        title={"Unauthorised"}
                                        message={"You do not have permission to view this page."} />;
                        default:
                                return <p>Error: {error}</p>;
                }
        }

        return (
                <PermissionsMenuContext.Provider value={{ permissionLevel: permissionsContent, menuContent }}>
                        {props.children}
                </PermissionsMenuContext.Provider>
        );
};

export const usePermissionsMenuContext = () => useContext(PermissionsMenuContext);