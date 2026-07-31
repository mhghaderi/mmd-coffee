"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const StoreContext = createContext(null);

const CART_STORAGE_KEY = "mmd-coffee-cart-v2";

const WISHLIST_STORAGE_KEY = "mmd-coffee-wishlist-v2";

const objectIdPattern = /^[a-f\d]{24}$/i;

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
        if (!isHydrated) {
            return;
        }

        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems, isHydrated]);

    useEffect(() => {
        if (!isHydrated) {
            return;
        }

        window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    }, [wishlistItems, isHydrated]);

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

                    price: Number(product.price) || 0,

                    discountPercent: Number(product.discountPercent ?? product.discount) || 0,

                    variant,
                    addOns,
                    quantity,
                },
            ];
        });

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
    };

    const toggleWishlist = (product) => {
        const { productId, slug } = getProductIdentity(product);

        const identity = productId || slug;

        if (!identity) {
            return;
        }

        setWishlistItems((currentItems) => {
            const exists = currentItems.some((item) => {
                const itemIdentity = getProductIdentity(item);

                return itemIdentity.productId === productId && itemIdentity.slug === slug;
            });

            if (exists) {
                return currentItems.filter((item) => {
                    const itemIdentity = getProductIdentity(item);

                    return !(itemIdentity.productId === productId && itemIdentity.slug === slug);
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
    const getCartItemQuantity = (identifier) => {
        const item = cartItems.find(
            (item) =>
                item.id === identifier || item.productId === identifier || item.key === identifier,
        );

        return item ? item.quantity : 0;
    };

    const value = {
        isHydrated,

        cartItems,
        cart: cartItems,
        cartCount,
        subtotal,
        cartTotal: subtotal,

        addToCart,
        updateQuantity,
        incrementQuantity,
        decrementQuantity,
        removeFromCart,
        removeItemFromCart: removeFromCart,
        clearCart,
        getCartItemQuantity,

        checkoutItems,

        wishlistItems,
        wishlist: wishlistItems,
        wishlistCount,
        toggleWishlist,
        isInWishlist,

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
