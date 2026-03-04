import React from "react";
import { RecommendedProduct, Language, Brand } from "@/lib/types";
import { BRAND_COLORS } from "@/lib/constants";
import { getProductImageUrl } from "@/lib/product-images";

interface FlyerTemplateProps {
  storeName: string;
  products: RecommendedProduct[];
  language: Language;
  translatedNames?: Record<string, string>; // productId -> translated name
  title?: string;
  footer?: string;
}

export const FlyerTemplate = React.forwardRef<HTMLDivElement, FlyerTemplateProps>(
  function FlyerTemplate({ storeName, products, language, translatedNames, title, footer }, ref) {
    const isRTL = language === "ur";
    const date = new Date().toLocaleDateString(
      language === "hi" ? "hi-IN" : language === "ur" ? "ur-PK" : "en-GB",
      { day: "numeric", month: "long", year: "numeric" }
    );

    const defaultTitle = language === "hi"
      ? "आपके लिए सिफारिशें"
      : language === "ur"
        ? "آپ کے لیے سفارشات"
        : "Recommended For You";

    const displayTitle = title || defaultTitle;

    const getProductName = (product: RecommendedProduct) => {
      if (translatedNames && translatedNames[product.productId]) {
        return translatedNames[product.productId];
      }
      return product.productName;
    };

    return (
      <div
        ref={ref}
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          width: "600px",
          backgroundColor: "#FFF8E7",
          fontFamily: isRTL
            ? "'Noto Nastaliq Urdu', 'Segoe UI', serif"
            : language === "hi"
              ? "'Noto Sans Devanagari', 'Segoe UI', sans-serif"
              : "'Inter', 'Segoe UI', sans-serif",
          padding: 0,
          margin: 0,
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #004B87 0%, #0066B3 100%)",
          padding: "24px 30px",
          textAlign: "center",
        }}>
          <div style={{
            color: "white",
            fontSize: "28px",
            fontWeight: "bold",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}>
            {displayTitle}
          </div>
          <div style={{
            color: "#B8D4E8",
            fontSize: "14px",
            marginTop: "8px",
          }}>
            {storeName} - {date}
          </div>
        </div>

        {/* Product Grid */}
        <div style={{
          padding: "20px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}>
          {products.slice(0, 12).map((product) => {
            const brandColors = BRAND_COLORS[product.brand] || BRAND_COLORS["TRS"];
            const imageUrl = getProductImageUrl(product.productId);
            return (
              <div key={product.productId} style={{
                backgroundColor: "white",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                textAlign: "center",
              }}>
                {/* Product image or color block */}
                <div style={{
                  backgroundColor: brandColors.primary,
                  padding: imageUrl ? "8px" : "20px 12px",
                  minHeight: "100px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}>
                  {/* Deal badge */}
                  {product.promotion && (
                    <div style={{
                      position: "absolute",
                      top: "6px",
                      right: isRTL ? "auto" : "6px",
                      left: isRTL ? "6px" : "auto",
                      backgroundColor: "#DC2626",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "bold",
                      padding: "2px 8px",
                      borderRadius: "99px",
                      zIndex: 2,
                    }}>
                      {product.promotion.discount}
                    </div>
                  )}

                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.productName}
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "contain",
                        borderRadius: "8px",
                        backgroundColor: "white",
                        padding: "4px",
                      }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div style={{
                      color: brandColors.text,
                      fontSize: "13px",
                      fontWeight: "600",
                      lineHeight: "1.3",
                    }}>
                      {getProductName(product)}
                    </div>
                  )}
                </div>

                {/* Product name + brand info */}
                <div style={{ padding: "8px 10px 10px" }}>
                  <div style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    lineHeight: "1.3",
                    minHeight: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {getProductName(product)}
                  </div>
                  <div style={{
                    fontSize: "10px",
                    color: brandColors.primary,
                    fontWeight: "600",
                    marginTop: "2px",
                  }}>
                    {product.brand}
                  </div>
                  {product.promotion && (
                    <div style={{
                      fontSize: "10px",
                      color: "#DC2626",
                      fontWeight: "500",
                      marginTop: "2px",
                    }}>
                      {product.promotion.discount}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: "#004B87",
          padding: "16px 30px",
          textAlign: "center",
        }}>
          <div style={{
            color: "#B8D4E8",
            fontSize: "12px",
          }}>
            {footer || "Vibrant Foods - Your trusted partner in quality ethnic foods"}
          </div>
          <div style={{
            color: "#87B5D6",
            fontSize: "10px",
            marginTop: "4px",
          }}>
            Generated by Vibrant Foods Sales Tool
          </div>
        </div>
      </div>
    );
  }
);
