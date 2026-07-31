"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const StoreContext = createContext(null);

const STORAGE_KEY = "mmd-coffee-store-v1";

const initialState = {
    cart: [],
    wishlist: [],
    isHydrated: false,
};

function calculateFinalPrice(product) {
    const discount = product.discountPercent || 0;

    return discount > 0 ? Math.round(product.price * (1 - discount / 100)) : product.price;
}

function createProductSnapshot(product) {
    return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        englishName: product.englishName,
        image: product.image,
        price: product.price,
        discountPercent: product.discountPercent || 0,
        finalPrice: calculateFinalPrice(product),
        isAvailable: product.isAvailable,
    };
}

function storeReducer(state, action) {
    switch (action.type) {
        case "HYDRATE_STORE":
            return {
                ...state,
                cart: action.payload.cart,
                wishlist: action.payload.wishlist,
                isHydrated: true,
            };

        case "ADD_TO_CART": {
            const product = action.payload;

            const existingItem = state.cart.find((item) => item.id === product.id);

            if (existingItem) {
                return {
                    ...state,
                    cart: state.cart.map((item) =>
                        item.id === product.id
                            ? {
                                  ...item,
                                  quantity: item.quantity + 1,
                              }
                            : item,
                    ),
                };
            }

            return {
                ...state,
                cart: [
                    ...state.cart,
                    {
                        ...createProductSnapshot(product),
                        quantity: 1,
                    },
                ],
            };
        }

        case "INCREASE_QUANTITY":
            return {
                ...state,
                cart: state.cart.map((item) =>
                    item.id === action.payload
                        ? {
                              ...item,
                              quantity: item.quantity + 1,
                          }
                        : item,
                ),
            };

        case "DECREASE_QUANTITY":
            return {
                ...state,
                cart: state.cart
                    .map((item) =>
                        item.id === action.payload
                            ? {
                                  ...item,
                                  quantity: item.quantity - 1,
                              }
                            : item,
                    )
                    .filter((item) => item.quantity > 0),
            };

        case "REMOVE_FROM_CART":
            return {
                ...state,
                cart: state.cart.filter((item) => item.id !== action.payload),
            };

        case "CLEAR_CART":
            return {
                ...state,
                cart: [],
            };

        case "TOGGLE_WISHLIST": {
            const product = action.payload;

            const alreadyExists = state.wishlist.some((item) => item.id === product.id);

            return {
                ...state,
                wishlist: alreadyExists
                    ? state.wishlist.filter((item) => item.id !== product.id)
                    : [...state.wishlist, createProductSnapshot(product)],
            };
        }

        default:
            return state;
    }
}

export function StoreProvider({ children }) {
    const [state, dispatch] = useReducer(storeReducer, initialState);

    useEffect(() => {
        let storedState = {
            cart: [],
            wishlist: [],
        };

        try {
            const savedStore = window.localStorage.getItem(STORAGE_KEY);

            if (savedStore) {
                const parsedStore = JSON.parse(savedStore);

                storedState = {
                    cart: Array.isArray(parsedStore.cart) ? parsedStore.cart : [],
                    wishlist: Array.isArray(parsedStore.wishlist) ? parsedStore.wishlist : [],
                };
            }
        } catch (error) {
            console.error("Store hydration failed:", error);
        }

        dispatch({
            type: "HYDRATE_STORE",
            payload: storedState,
        });
    }, []);

    useEffect(() => {
        if (!state.isHydrated) {
            return;
        }

        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    cart: state.cart,
                    wishlist: state.wishlist,
                }),
            );
        } catch (error) {
            console.error("Store persistence failed:", error);
        }
    }, [state.cart, state.wishlist, state.isHydrated]);

    const value = useMemo(() => {
        const cartCount = state.cart.reduce((total, item) => total + item.quantity, 0);

        const cartSubtotal = state.cart.reduce(
            (total, item) => total + item.finalPrice * item.quantity,
            0,
        );

        return {
            cart: state.cart,
            wishlist: state.wishlist,
            isHydrated: state.isHydrated,

            cartCount,
            wishlistCount: state.wishlist.length,
            cartSubtotal,

            addToCart(product) {
                if (!product?.isAvailable) {
                    return;
                }

                dispatch({
                    type: "ADD_TO_CART",
                    payload: product,
                });
            },

            increaseQuantity(productId) {
                dispatch({
                    type: "INCREASE_QUANTITY",
                    payload: productId,
                });
            },

            decreaseQuantity(productId) {
                dispatch({
                    type: "DECREASE_QUANTITY",
                    payload: productId,
                });
            },

            removeFromCart(productId) {
                dispatch({
                    type: "REMOVE_FROM_CART",
                    payload: productId,
                });
            },

            clearCart() {
                dispatch({
                    type: "CLEAR_CART",
                });
            },

            toggleWishlist(product) {
                dispatch({
                    type: "TOGGLE_WISHLIST",
                    payload: product,
                });
            },

            isInWishlist(productId) {
                return state.wishlist.some((item) => item.id === productId);
            },

            getCartItemQuantity(productId) {
                return state.cart.find((item) => item.id === productId)?.quantity || 0;
            },
        };
    }, [state]);

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
    const context = useContext(StoreContext);

    if (!context) {
        throw new Error("useStore must be used inside StoreProvider");
    }

    return context;
}
