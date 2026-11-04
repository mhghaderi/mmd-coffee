"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const StoreContext = createContext(null);

const CART_STORAGE_KEY = "mmd-coffee-cart-v2";

const WISHLIST_STORAGE_KEY = "mmd-coffee-wishlist-v2";

const objectIdPattern = /^[a-f\d]{24}$/i;
const shopCategorySlugs = new Set(["coffee-beans", "brewing-tools", "accessories", "gift-boxes"]);

function toStringId(value) {
    if (!value) {
        return "";
    }

    if (typeof value === "string") {
        return value.trim();
    }

    if (typeof value === "object" && typeof value.toString === "function") {
        return value.toString();
    }

    return "";
}

function getProductIdentity(product) {
    const rawId = toStringId(product?._id || product?.productId || product?.id);

    const productId = objectIdPattern.test(rawId) ? rawId : "";

    const slug =
        typeof product?.slug === "string"
            ? product.slug.trim().toLowerCase()
            : !productId && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawId)
              ? rawId.toLowerCase()
              : "";

    return {
        productId,
        slug,
    };
}

function getSubdocumentId(item) {
    return toStringId(item?._id || item?.originalId || item?.id);
}

function getDiscountedPrice(product) {
    const price = Number(product?.price) || 0;

    const discountPercent = Number(product?.discountPercent ?? product?.discount) || 0;

    return Math.round(price * (1 - Math.min(Math.max(discountPercent, 0), 100) / 100));
}

function getCatalogType(product) {
    const explicit = String(product?.catalogType || "").trim().toLowerCase();

    if (explicit === "shop" || explicit === "cafe") {
        return explicit;
    }

    if (product?.detailBasePath === "/shop") {
        return "shop";
    }

    const categorySlug = String(product?.categorySlug || product?.category?.slug || "").trim().toLowerCase();
    if (shopCategorySlugs.has(categorySlug)) {
        return "shop";
    }

    return "cafe";
}

function createCartKey({ productId, slug, variantId, addOnIds }) {
    const productKey = productId || `slug:${slug}`;

    const normalizedAddOns = [...addOnIds].sort().join(",");

    return [productKey, variantId || "default", normalizedAddOns || "no-addons"].join("::");
}

function normalizeStoredCartItem(item) {
    if (!item || typeof item !== "object") {
        return null;
    }

    const source =
        item.product && typeof item.product === "object"
            ? {
                  ...item.product,
                  ...item,
              }
            : item;

    const { productId, slug } = getProductIdentity(source);

    if (!productId && !slug) {
        return null;
    }

    const variant =
        source.variant && typeof source.variant === "object"
            ? {
                  id: getSubdocumentId(source.variant),

                  title: source.variant.title || "",

                  priceAdjustment: Number(source.variant.priceAdjustment) || 0,
              }
            : null;

    const addOns = Array.isArray(source.addOns)
        ? source.addOns
              .map((addOn) => ({
                  id: getSubdocumentId(addOn),
                  title: addOn.title || "",
                  price: Number(addOn.price) || 0,
              }))
              .filter((addOn) => addOn.id)
        : [];

    const addOnIds = addOns.map((addOn) => addOn.id);

    const key =
        source.key ||
        createCartKey({
            productId,
            slug,
            variantId: variant?.id || "",
            addOnIds,
        });

    return {
        key,

        id: productId || slug,
        _id: productId || undefined,

        productId,
        slug,

        name: source.name || source.title || "محصول",

        englishName: source.englishName || "",

        image: source.image || "",

        categorySlug:
            source.categorySlug || source.category?.slug || "",

        detailBasePath: source.detailBasePath || "",

        catalogType: getCatalogType(source),

        price: Number(source.price) || 0,

        discountPercent: Number(source.discountPercent ?? source.discount) || 0,

        variant,
        addOns,

        quantity: Math.max(1, Number.parseInt(source.quantity || 1, 10) || 1),
    };
}

function readStoredArray(storageKey) {
    try {
        const storedValue = window.localStorage.getItem(storageKey);

        if (!storedValue) {
            return [];
        }

        const parsedValue = JSON.parse(storedValue);

        return Array.isArray(parsedValue) ? parsedValue : [];
    } catch {
        return [];
    }
}

export function StoreProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    const [wishlistItems, setWishlistItems] = useState([]);

    const [isCartOpen, setIsCartOpen] = useState(false);

    const [isHydrated, setIsHydrated] = useState(false);

    const [hasDatabaseProfile, setHasDatabaseProfile] = useState(false);
    const [preferencesReady, setPreferencesReady] = useState(false);
    const databaseProfileRef = useRef(false);
    const databaseCartReadyRef = useRef(false);
    const cartSyncTimerRef = useRef(null);
    const cartItemsRef = useRef([]);
    const wishlistItemsRef = useRef([]);

    useEffect(() => {
        const storedCart = readStoredArray(CART_STORAGE_KEY)
            .map(normalizeStoredCartItem)
            .filter(Boolean);

        const storedWishlist = readStoredArray(WISHLIST_STORAGE_KEY);

        setCartItems(storedCart);
        setWishlistItems(storedWishlist);
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        cartItemsRef.current = cartItems;
    }, [cartItems]);

    useEffect(() => {
        wishlistItemsRef.current = wishlistItems;
    }, [wishlistItems]);

    const syncPreferencesFromDatabase = async () => {
        try {
            const response = await fetch("/api/user/preferences", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok || !payload?.authenticated) {
                if (databaseProfileRef.current) {
                    setWishlistItems([]);
                    setCartItems([]);
                    wishlistItemsRef.current = [];
                    cartItemsRef.current = [];
                }
                databaseProfileRef.current = false;
                databaseCartReadyRef.current = false;
                setHasDatabaseProfile(false);
                setPreferencesReady(true);
                return;
            }

            databaseProfileRef.current = true;

            const localWishlistIds = wishlistItemsRef.current
                .map((item) => getProductIdentity(item).productId)
                .filter(Boolean);

            let nextWishlist = Array.isArray(payload?.data?.wishlist)
                ? payload.data.wishlist
                : [];

            if (localWishlistIds.length) {
                const syncResponse = await fetch("/api/user/preferences", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "sync_wishlist",
                        productIds: localWishlistIds,
                    }),
                });

                const syncPayload = await syncResponse.json().catch(() => ({}));
                if (syncResponse.ok && Array.isArray(syncPayload?.data?.wishlist)) {
                    nextWishlist = syncPayload.data.wishlist;
                }
            }

            const localCart = cartItemsRef.current
                .filter((item) => item.productId)
                .map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    variantId: item.variant?.id || "",
                    addOnIds: item.addOns.map((addOn) => addOn.id),
                }));

            let cartResponse;
            if (localCart.length) {
                cartResponse = await fetch("/api/user/cart", {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mode: "merge", items: localCart }),
                });
            } else {
                cartResponse = await fetch("/api/user/cart", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });
            }

            const cartPayload = await cartResponse.json().catch(() => ({}));
            if (!cartResponse.ok || !Array.isArray(cartPayload?.data?.cart)) {
                throw new Error(cartPayload?.message || "دریافت سبد دیتابیس انجام نشد");
            }

            const databaseCart = cartPayload.data.cart
                .map(normalizeStoredCartItem)
                .filter(Boolean);

            setWishlistItems(nextWishlist);
            setCartItems(databaseCart);
            wishlistItemsRef.current = nextWishlist;
            cartItemsRef.current = databaseCart;
            databaseCartReadyRef.current = true;
            setHasDatabaseProfile(true);

            try {
                window.localStorage.removeItem(CART_STORAGE_KEY);
                window.localStorage.removeItem(WISHLIST_STORAGE_KEY);
            } catch {}
        } catch (error) {
            console.error("SYNC USER DATABASE STATE ERROR:", error);
        } finally {
            setPreferencesReady(true);
        }
    };

    useEffect(() => {
        if (!isHydrated) return undefined;

        syncPreferencesFromDatabase();

        const handleAuthChanged = () => {
            setPreferencesReady(false);
            databaseCartReadyRef.current = false;
            syncPreferencesFromDatabase();
        };

        window.addEventListener("mmd-auth-changed", handleAuthChanged);
        return () => window.removeEventListener("mmd-auth-changed", handleAuthChanged);

    }, [isHydrated]);

    const recordInteraction = (product, event = "view") => {
        const { productId } = getProductIdentity(product);
        if (!hasDatabaseProfile || !productId) return;

        fetch("/api/user/preferences", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "record",
                productId,
                event,
            }),
        }).catch(() => {});
    };

    useEffect(() => {
        if (!isHydrated) return;

        if (hasDatabaseProfile) {
            window.localStorage.removeItem(CART_STORAGE_KEY);
            return;
        }

        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems, hasDatabaseProfile, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;

        if (hasDatabaseProfile) {
            window.localStorage.removeItem(WISHLIST_STORAGE_KEY);
            return;
        }

        window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    }, [wishlistItems, hasDatabaseProfile, isHydrated]);

    useEffect(() => {
        if (!isHydrated || !hasDatabaseProfile || !preferencesReady || !databaseCartReadyRef.current) {
            return undefined;
        }

        if (cartSyncTimerRef.current) {
            window.clearTimeout(cartSyncTimerRef.current);
        }

        cartSyncTimerRef.current = window.setTimeout(() => {
            const items = cartItemsRef.current
                .filter((item) => item.productId)
                .map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    variantId: item.variant?.id || "",
                    addOnIds: item.addOns.map((addOn) => addOn.id),
                }));

            fetch("/api/user/cart", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode: "replace", items }),
            }).catch(() => {});
        }, 220);

        return () => {
            if (cartSyncTimerRef.current) {
                window.clearTimeout(cartSyncTimerRef.current);
            }
        };
    }, [cartItems, hasDatabaseProfile, isHydrated, preferencesReady]);

    const addToCart = (product, options = {}) => {
        const normalizedOptions =
            typeof options === "number"
                ? {
                      quantity: options,
                  }
                : options || {};

        const { productId, slug } = getProductIdentity(product);

        if (!productId && !slug) {
            return false;
        }

        const activeVariants = Array.isArray(product.variants)
            ? product.variants.filter((variant) => variant.isActive !== false)
            : [];

        const selectedVariant =
            normalizedOptions.variant ||
            activeVariants.find((variant) => variant.isDefault) ||
            null;

        const selectedAddOns = Array.isArray(normalizedOptions.addOns)
            ? normalizedOptions.addOns
            : [];

        const variant = selectedVariant
            ? {
                  id: getSubdocumentId(selectedVariant),

                  title: selectedVariant.title || "",

                  priceAdjustment: Number(selectedVariant.priceAdjustment) || 0,
              }
            : null;

        const addOns = selectedAddOns
            .map((addOn) => ({
                id: getSubdocumentId(addOn),
                title: addOn.title || "",
                price: Number(addOn.price) || 0,
            }))
            .filter((addOn) => addOn.id);

        const addOnIds = addOns.map((addOn) => addOn.id);

        const key = createCartKey({
            productId,
            slug,
            variantId: variant?.id || "",
            addOnIds,
        });

        const quantity = Math.max(1, Number.parseInt(normalizedOptions.quantity || 1, 10) || 1);

        setCartItems((currentItems) => {
            const existingItem = currentItems.find((item) => item.key === key);

            if (existingItem) {
                return currentItems.map((item) =>
                    item.key === key
                        ? {
                              ...item,

                              quantity: item.quantity + quantity,
                          }
                        : item,
                );
            }

            return [
                ...currentItems,

                {
                    key,

                    id: productId || slug,
                    _id: productId || undefined,

                    productId,
                    slug,

                    name: product.name || product.title || "محصول",

                    englishName: product.englishName || "",

                    image: product.image || "",

                    categorySlug:
                        product.categorySlug || product.category?.slug || "",

                    detailBasePath:
                        normalizedOptions.detailBasePath || product.detailBasePath || "",

                    catalogType: getCatalogType({
                        ...product,
                        detailBasePath:
                            normalizedOptions.detailBasePath || product.detailBasePath || "",
                    }),

                    price: Number(product.price) || 0,

                    discountPercent: Number(product.discountPercent ?? product.discount) || 0,

                    variant,
                    addOns,
                    quantity,
                },
            ];
        });

        recordInteraction(product, "cart");
        setIsCartOpen(true);

        return true;
    };

    const updateQuantity = (identifier, nextValue) => {
        setCartItems((currentItems) =>
            currentItems
                .map((item) => {
                    const matches =
                        item.key === identifier ||
                        item.id === identifier ||
                        item.productId === identifier;

                    if (!matches) {
                        return item;
                    }

                    let nextQuantity;

                    if (nextValue === "increase" || nextValue === "+") {
                        nextQuantity = item.quantity + 1;
                    } else if (nextValue === "decrease" || nextValue === "-") {
                        nextQuantity = item.quantity - 1;
                    } else {
                        nextQuantity = Number.parseInt(nextValue, 10);
                    }

                    return {
                        ...item,

                        quantity: Number.isFinite(nextQuantity) ? nextQuantity : item.quantity,
                    };
                })
                .filter((item) => item.quantity > 0),
        );
    };

    const incrementQuantity = (identifier) => {
        updateQuantity(identifier, "increase");
    };

    const decrementQuantity = (identifier) => {
        updateQuantity(identifier, "decrease");
    };

    const removeFromCart = (identifier) => {
        setCartItems((currentItems) =>
            currentItems.filter(
                (item) =>
                    item.key !== identifier &&
                    item.id !== identifier &&
                    item.productId !== identifier,
            ),
        );
    };

    const clearCart = () => {
        setCartItems([]);
        setIsCartOpen(false);

        if (hasDatabaseProfile) {
            fetch("/api/user/cart", {
                method: "DELETE",
                credentials: "include",
            }).catch(() => {});
        }
    };

    const toggleWishlist = (product) => {
        const { productId, slug } = getProductIdentity(product);
        const identity = productId || slug;

        if (!identity) return false;

        let nextAdded = false;

        setWishlistItems((currentItems) => {
            const exists = currentItems.some((item) => {
                const itemIdentity = getProductIdentity(item);
                return (productId && itemIdentity.productId === productId) ||
                    (!productId && slug && itemIdentity.slug === slug);
            });

            nextAdded = !exists;

            if (exists) {
                return currentItems.filter((item) => {
                    const itemIdentity = getProductIdentity(item);
                    return !((productId && itemIdentity.productId === productId) ||
                        (!productId && slug && itemIdentity.slug === slug));
                });
            }

            return [
                ...currentItems,
                {
                    ...product,
                    id: identity,
                },
            ];
        });

        if (productId) {
            fetch("/api/user/preferences", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "toggle_wishlist", productId }),
            })
                .then(async (response) => {
                    const payload = await response.json().catch(() => ({}));
                    if (response.ok && Array.isArray(payload?.data?.wishlist)) {
                        setWishlistItems(payload.data.wishlist);
                    }
                })
                .catch(() => {});
        }

        return nextAdded;
    };

    const isInWishlist = (product) => {
        const { productId, slug } = getProductIdentity(product);

        return wishlistItems.some((item) => {
            const itemIdentity = getProductIdentity(item);

            return itemIdentity.productId === productId && itemIdentity.slug === slug;
        });
    };

    const cartCount = useMemo(
        () => cartItems.reduce((total, item) => total + item.quantity, 0),
        [cartItems],
    );

    const wishlistCount = wishlistItems.length;

    const subtotal = useMemo(
        () =>
            cartItems.reduce((total, item) => {
                const basePrice = getDiscountedPrice(item);

                const variantPrice = Number(item.variant?.priceAdjustment) || 0;

                const addOnsPrice = item.addOns.reduce(
                    (sum, addOn) => sum + (Number(addOn.price) || 0),
                    0,
                );

                return total + (basePrice + variantPrice + addOnsPrice) * item.quantity;
            }, 0),
        [cartItems],
    );

    const cafeCartItems = useMemo(
        () => cartItems.filter((item) => getCatalogType(item) === "cafe"),
        [cartItems],
    );

    const shopCartItems = useMemo(
        () => cartItems.filter((item) => getCatalogType(item) === "shop"),
        [cartItems],
    );

    const getCheckoutItems = (catalogType) =>
        cartItems
            .filter((item) => !catalogType || getCatalogType(item) === catalogType)
            .map((item) => ({
                productId: item.productId || item.slug,
                slug: item.slug,
                quantity: item.quantity,
                variantId: item.variant?.id || "",
                addOnIds: item.addOns.map((addOn) => addOn.id),
            }));

    const clearCartType = (catalogType) => {
        setCartItems((currentItems) =>
            currentItems.filter((item) => getCatalogType(item) !== catalogType),
        );
        setIsCartOpen(false);
    };

    const subtotalsByType = useMemo(() => {
        const calculate = (items) =>
            items.reduce((total, item) => {
                const basePrice = getDiscountedPrice(item);
                const variantPrice = Number(item.variant?.priceAdjustment) || 0;
                const addOnsPrice = item.addOns.reduce(
                    (sum, addOn) => sum + (Number(addOn.price) || 0),
                    0,
                );
                return total + (basePrice + variantPrice + addOnsPrice) * item.quantity;
            }, 0);

        return {
            cafe: calculate(cafeCartItems),
            shop: calculate(shopCartItems),
        };
    }, [cafeCartItems, shopCartItems]);

    const cartCountsByType = useMemo(
        () => ({
            cafe: cafeCartItems.reduce((sum, item) => sum + item.quantity, 0),
            shop: shopCartItems.reduce((sum, item) => sum + item.quantity, 0),
        }),
        [cafeCartItems, shopCartItems],
    );

    const checkoutItems = useMemo(
        () =>
            cartItems.map((item) => ({
                productId: item.productId || item.slug,

                slug: item.slug,

                quantity: item.quantity,

                variantId: item.variant?.id || "",

                addOnIds: item.addOns.map((addOn) => addOn.id),
            })),
        [cartItems],
    );
    const getCartItemQuantity = (productOrIdentifier) => {
        const identifier =
            typeof productOrIdentifier === "string"
                ? productOrIdentifier.trim()
                : "";

        const identity =
            typeof productOrIdentifier === "object" && productOrIdentifier
                ? getProductIdentity(productOrIdentifier)
                : {
                      productId: objectIdPattern.test(identifier) ? identifier : "",
                      slug: objectIdPattern.test(identifier)
                          ? ""
                          : identifier.toLowerCase(),
                  };

        return cartItems.reduce((total, item) => {
            const matches =
                (identifier && (item.key === identifier || item.id === identifier)) ||
                (identity.productId && item.productId === identity.productId) ||
                (identity.slug && item.slug === identity.slug);

            return matches ? total + item.quantity : total;
        }, 0);
    };

    const changeProductQuantity = (product, direction) => {
        const identity = getProductIdentity(product);

        setCartItems((currentItems) => {
            const matchingIndex = currentItems.findIndex((item) =>
                (identity.productId && item.productId === identity.productId) ||
                (identity.slug && item.slug === identity.slug),
            );

            if (matchingIndex === -1) {
                return currentItems;
            }

            return currentItems
                .map((item, index) =>
                    index === matchingIndex
                        ? { ...item, quantity: item.quantity + direction }
                        : item,
                )
                .filter((item) => item.quantity > 0);
        });
    };

    const incrementProductQuantity = (product) => changeProductQuantity(product, 1);
    const decrementProductQuantity = (product) => changeProductQuantity(product, -1);

    const clearWishlist = () => {
        setWishlistItems([]);

        if (hasDatabaseProfile) {
            fetch("/api/user/preferences", {
                method: "DELETE",
                credentials: "include",
            }).catch(() => {});
        }
    };

    const value = {
        isHydrated,

        cartItems,
        cart: cartItems,
        cartCount,
        subtotal,
        cartSubtotal: subtotal,
        cartTotal: subtotal,

        addToCart,
        updateQuantity,
        incrementQuantity,
        increaseQuantity: incrementQuantity,
        decrementQuantity,
        decreaseQuantity: decrementQuantity,
        removeFromCart,
        removeItemFromCart: removeFromCart,
        clearCart,
        getCartItemQuantity,
        incrementProductQuantity,
        decrementProductQuantity,

        checkoutItems,
        getCheckoutItems,
        clearCartType,
        cafeCartItems,
        shopCartItems,
        subtotalsByType,
        cartCountsByType,

        wishlistItems,
        wishlist: wishlistItems,
        wishlistCount,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        hasDatabaseProfile,
        preferencesReady,
        recordInteraction,
        syncPreferencesFromDatabase,

        isCartOpen,

        openCart: () => setIsCartOpen(true),

        closeCart: () => setIsCartOpen(false),

        toggleCart: () => setIsCartOpen((current) => !current),
    };

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
    const context = useContext(StoreContext);

    if (!context) {
        throw new Error("useStore باید داخل StoreProvider استفاده شود");
    }

    return context;
}

export default StoreProvider;
