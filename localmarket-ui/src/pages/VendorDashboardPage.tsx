import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  Navigation,
  PencilLine,
  Plus,
  RotateCcw,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createProduct,
  deleteProduct,
  fetchProductsByShop,
  updateProduct,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Product, ProductDraft } from "@/types";

const emptyProductDraft: ProductDraft = {
  name: "",
  price: "",
  originalPrice: "",
  currency: "INR",
  description: "",
  category: "",
  type: "",
  attributes: "",
  images: "",
  userId: "",
};

type SheetRow = {
  id: string;
  productId: string | null;
  draft: ProductDraft;
};

type ProductDraftField = keyof ProductDraft;
type DashboardView = "sheet" | "storefront";

const sheetColumns: Array<{
  field: ProductDraftField;
  heading: string;
  placeholder: string;
  width: string;
  multiline?: boolean;
}> = [
  {
    field: "name",
    heading: "Name",
    placeholder: "Product name",
    width: "220px",
  },
  { field: "price", heading: "Price", placeholder: "0", width: "110px" },
  {
    field: "originalPrice",
    heading: "Original",
    placeholder: "0",
    width: "120px",
  },
  {
    field: "currency",
    heading: "Currency",
    placeholder: "INR",
    width: "100px",
  },
  {
    field: "category",
    heading: "Category",
    placeholder: "Category",
    width: "160px",
  },
  { field: "type", heading: "Type", placeholder: "Type", width: "140px" },
  {
    field: "description",
    heading: "Description",
    placeholder: "Description",
    width: "280px",
    multiline: true,
  },
  {
    field: "attributes",
    heading: "Attributes JSON",
    placeholder: '{"size":"M"}',
    width: "260px",
    multiline: true,
  },
  {
    field: "images",
    heading: "Image URLs",
    placeholder: "https://...",
    width: "260px",
    multiline: true,
  },
];

function draftFromProduct(product: Product): ProductDraft {
  return {
    name: product.productName,
    price: String(product.price),
    originalPrice:
      product.originalPrice !== null ? String(product.originalPrice) : "",
    currency: product.currency ?? "INR",
    description: product.description,
    category: product.category,
    type: product.type ?? "",
    attributes: product.attributes ? JSON.stringify(product.attributes) : "",
    images: product.images.join("\n"),
    userId: product.shopId,
  };
}

function createBlankSheetRow(userId: string): SheetRow {
  return {
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    productId: null,
    draft: { ...emptyProductDraft, userId },
  };
}

export function VendorDashboardPage() {
  const { shopkeeperSession } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sheetRows, setSheetRows] = useState<SheetRow[]>([]);
  const [status, setStatus] = useState("Loading vendor dashboard...");
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [busyRowId, setBusyRowId] = useState<string | null>(null);
  const [dashboardView, setDashboardView] = useState<DashboardView>("sheet");

  const selectedShop = useMemo(
    () =>
      shopkeeperSession
        ? {
            id: shopkeeperSession.id,
            shopName: shopkeeperSession.shopName,
            shopLocation: shopkeeperSession.shopLocation,
          }
        : null,
    [shopkeeperSession],
  );

  useEffect(() => {
    async function loadProducts() {
      if (!shopkeeperSession?.id) {
        setProducts([]);
        setStatus("No shop is linked to this shopkeeper account.");
        return;
      }

      try {
        const productData = await fetchProductsByShop(shopkeeperSession.id);
        setProducts(productData);
        setSheetRows(
          productData.length > 0
            ? productData.map((product) => ({
                id: product.productId,
                productId: product.productId,
                draft: draftFromProduct(product),
              }))
            : [createBlankSheetRow(shopkeeperSession.id)],
        );
        setStatus("Manage the inventory for your shop.");
      } catch (error) {
        console.error(error);
        setStatus("Unable to load shop inventory.");
      }
    }

    loadProducts();
  }, [shopkeeperSession]);

  const inventoryTotal = useMemo(
    () =>
      products.reduce(
        (total, product) =>
          total + (Number.isFinite(product.price) ? product.price : 0),
        0,
      ),
    [products],
  );

  function updateSheetCell(
    rowId: string,
    field: keyof ProductDraft,
    value: string,
  ) {
    setSheetRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? {
              ...row,
              draft: {
                ...row.draft,
                [field]: value,
              },
            }
          : row,
      ),
    );
  }

  function addSheetRow() {
    if (!shopkeeperSession?.id) {
      setStatus("Sign in again to manage your shop.");
      return;
    }

    setSheetRows((current) => [
      ...current,
      createBlankSheetRow(shopkeeperSession.id),
    ]);
    setStatus("Added a blank spreadsheet row.");
  }

  async function handleSaveRow(row: SheetRow) {
    if (!shopkeeperSession?.id) {
      setStatus("Sign in again to manage your shop.");
      return;
    }

    if (
      !row.draft.name.trim() ||
      !row.draft.price.trim() ||
      !row.draft.category.trim()
    ) {
      setStatus("Product name, price, and category are required.");
      return;
    }

    if (!Number.isFinite(Number(row.draft.price))) {
      setStatus("Price must be a valid number.");
      return;
    }

    if (
      row.draft.originalPrice.trim() &&
      !Number.isFinite(Number(row.draft.originalPrice))
    ) {
      setStatus("Original price must be a valid number.");
      return;
    }

    try {
      setBusyRowId(row.id);
      const draft = { ...row.draft, userId: shopkeeperSession.id };

      if (row.productId !== null) {
        const savedProduct = await updateProduct(row.productId, draft);
        setProducts((current) =>
          current.map((product) =>
            product.productId === savedProduct.productId
              ? savedProduct
              : product,
          ),
        );
        setSheetRows((current) =>
          current.map((currentRow) =>
            currentRow.id === row.id
              ? {
                  id: savedProduct.productId,
                  productId: savedProduct.productId,
                  draft: draftFromProduct(savedProduct),
                }
              : currentRow,
          ),
        );
        setStatus("Product row updated successfully.");
      } else {
        const savedProduct = await createProduct(draft);
        setProducts((current) => [
          ...current.filter(
            (product) => product.productId !== savedProduct.productId,
          ),
          savedProduct,
        ]);
        setSheetRows((current) =>
          current.map((currentRow) =>
            currentRow.id === row.id
              ? {
                  id: savedProduct.productId,
                  productId: savedProduct.productId,
                  draft: draftFromProduct(savedProduct),
                }
              : currentRow,
          ),
        );
        setStatus("Product row added successfully.");
      }
    } catch (error) {
      console.error(error);
      setStatus(
        error instanceof Error ? error.message : "Unable to save product.",
      );
    } finally {
      setBusyRowId(null);
    }
  }

  function handleResetRow(row: SheetRow) {
    if (row.productId === null) {
      setSheetRows((current) =>
        current.map((currentRow) =>
          currentRow.id === row.id
            ? {
                ...currentRow,
                draft: {
                  ...emptyProductDraft,
                  userId: shopkeeperSession?.id ?? "",
                },
              }
            : currentRow,
        ),
      );
      return;
    }

    const product = products.find((item) => item.productId === row.productId);
    if (!product) {
      return;
    }

    setSheetRows((current) =>
      current.map((currentRow) =>
        currentRow.id === row.id
          ? { ...currentRow, draft: draftFromProduct(product) }
          : currentRow,
      ),
    );
  }

  async function handleJsonUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !shopkeeperSession?.id) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) {
        throw new Error("JSON file must contain an array of products.");
      }

      for (const item of parsed) {
        const nextDraft: ProductDraft = {
          name: String(item.name ?? item.productName ?? ""),
          price: String(item.price ?? ""),
          originalPrice:
            item.originalPrice != null ? String(item.originalPrice) : "",
          currency: String(item.currency ?? "INR"),
          description: String(item.description ?? ""),
          category: String(item.category ?? ""),
          type: String(item.type ?? ""),
          attributes: item.attributes ? JSON.stringify(item.attributes) : "",
          images: Array.isArray(item.images)
            ? item.images.join("\n")
            : String(item.images ?? item.image ?? ""),
          userId: shopkeeperSession.id,
        };

        if (
          !nextDraft.name.trim() ||
          !nextDraft.price.trim() ||
          !nextDraft.category.trim()
        ) {
          throw new Error(
            "Every imported product needs name, price, and category.",
          );
        }

        await createProduct(nextDraft);
      }

      const refreshedProducts = await fetchProductsByShop(shopkeeperSession.id);
      setProducts(refreshedProducts);
      setSheetRows(
        refreshedProducts.map((product) => ({
          id: product.productId,
          productId: product.productId,
          draft: draftFromProduct(product),
        })),
      );
      setStatus(`Imported ${parsed.length} products from JSON.`);
    } catch (error) {
      console.error(error);
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to import JSON products.",
      );
    }
  }

  async function handleDeleteProduct(productId: string) {
    try {
      setBusyRowId(productId);
      await deleteProduct(productId);
      setProducts((current) =>
        current.filter((product) => product.productId !== productId),
      );
      setSheetRows((current) => {
        const nextRows = current.filter((row) => row.productId !== productId);
        return nextRows.length > 0
          ? nextRows
          : [createBlankSheetRow(shopkeeperSession?.id ?? "")];
      });
      setStatus("Product deleted successfully.");
    } catch (error) {
      console.error(error);
      setStatus(
        error instanceof Error ? error.message : "Unable to delete product.",
      );
    } finally {
      setBusyRowId(null);
    }
  }

  function removeUnsavedRow(rowId: string) {
    setSheetRows((current) => {
      const nextRows = current.filter((row) => row.id !== rowId);
      return nextRows.length > 0
        ? nextRows
        : [createBlankSheetRow(shopkeeperSession?.id ?? "")];
    });
    setStatus("Removed unsaved row.");
  }

  function handleDetectShopLocation() {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus(
          `Detected location: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}.`,
        );
      },
      () => setStatus("Unable to access your current location."),
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }

  return (
    <div className="page-stack vendor-dashboard-page">
      {/* HEADER */}
      <section className="section-heading">
        <div>
          <p className="section-kicker">Vendor dashboard</p>

          <h2 className="text-3xl font-bold">Manage shop inventory</h2>

          <p className="text-muted-foreground">{status}</p>
        </div>

        <div className="vendor-location-panel">
          <div className="hero-inline text-amber-900">
            <span className="text-amber-700">Signed in shop</span>
            <strong>{shopkeeperSession?.shopName ?? "Dashboard"}</strong>
          </div>
          <Button type="button" variant="outline" onClick={handleDetectShopLocation}>
            <Navigation className="size-4" />
            Auto-detect location
          </Button>
        </div>
      </section>

      {/* MAIN */}
      <section className="results-column">
        <Card className="inventory-sheet-card">
          {/* HEADER */}
          <CardHeader>
            <div className="sheet-header">
              <div>
                <CardTitle>
                  {selectedShop?.shopName ?? "Inventory spreadsheet"}
                </CardTitle>

                <CardDescription>
                  Edit inventory directly inside the spreadsheet. Save rows
                  individually when ready.
                </CardDescription>
              </div>

              {/* STATS */}
              <div className="sheet-stats">
                <span>{sheetRows.length} rows</span>
                <span>{products.length} saved</span>
                <strong>INR {inventoryTotal.toFixed(0)}</strong>
              </div>
            </div>
          </CardHeader>

          {/* CONTENT */}
          <CardContent className="sheet-content">
            {/* TOOLBAR */}
            <div className="sheet-toolbar">
              <div className="sheet-toolbar-actions">
                <Button type="button" onClick={addSheetRow}>
                  <Plus className="size-4" />
                  Add Row
                </Button>

                <label className="sheet-upload-button">
                  <Upload className="size-4" />
                  Import JSON
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={handleJsonUpload}
                  />
                </label>
              </div>

              <p className="m-0 text-sm text-muted-foreground">
                Spreadsheet mode enabled
              </p>
            </div>

            <div
              className="dashboard-view-tabs"
              role="tablist"
              aria-label="Inventory views"
            >
              <button
                type="button"
                className={dashboardView === "sheet" ? "active" : undefined}
                onClick={() => setDashboardView("sheet")}
              >
                <PencilLine className="size-4" />
                Excel sheet
              </button>
              <button
                type="button"
                className={
                  dashboardView === "storefront" ? "active" : undefined
                }
                onClick={() => setDashboardView("storefront")}
              >
                <Eye className="size-4" />
                Buyer preview
              </button>
            </div>

            {/* EMPTY */}
            {dashboardView === "storefront" ? (
              <div className="storefront-preview">
                <div className="storefront-preview-header">
                  <div>
                    <p className="section-kicker">Buyer preview</p>
                    <h3>{selectedShop?.shopName ?? "Your shop"}</h3>
                    <span>{selectedShop?.shopLocation ?? "Shop location"}</span>
                  </div>
                  <strong>
                    {products.length} listed product
                    {products.length === 1 ? "" : "s"}
                  </strong>
                </div>

                {products.length === 0 ? (
                  <div className="empty-state">
                    Save products in the sheet to preview your shop like a
                    buyer.
                  </div>
                ) : (
                  <div className="storefront-product-grid">
                    {products.map((product) => (
                      <article
                        key={product.productId}
                        className="storefront-product-card"
                      >
                        <div className="storefront-product-media">
                          {product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.productName}
                            />
                          ) : (
                            <span>
                              {product.productName.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="storefront-product-body">
                          <div className="storefront-product-rating">
                            <Star className="size-3.5" />
                            <span>Buyer view</span>
                          </div>
                          <h4>{product.productName}</h4>
                          <p>
                            {[product.category, product.type]
                              .filter(Boolean)
                              .join(" · ") || "General item"}
                          </p>
                          {product.description && (
                            <p className="storefront-product-description">
                              {product.description}
                            </p>
                          )}
                        </div>

                        <div className="storefront-product-footer">
                          <div>
                            <strong>
                              {product.currency ?? "INR"}{" "}
                              {product.price.toFixed(0)}
                            </strong>
                            {product.originalPrice !== null &&
                              product.originalPrice > product.price && (
                                <span>
                                  {product.currency ?? "INR"}{" "}
                                  {product.originalPrice.toFixed(0)}
                                </span>
                              )}
                          </div>
                          <button type="button">View</button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : sheetRows.length === 0 ? (
              <div className="empty-state">No products added yet.</div>
            ) : (
              /* TABLE */
              <div className="spreadsheet-wrap">
                <table className="spreadsheet-grid">
                  {/* HEADER */}
                  <thead>
                    <tr>
                      <th className="sheet-row-number">#</th>

                      {sheetColumns.map((column) => (
                        <th key={column.field} style={{ width: column.width }}>
                          {column.heading}
                        </th>
                      ))}

                      <th>Actions</th>
                    </tr>
                  </thead>

                  {/* BODY */}
                  <tbody>
                    {sheetRows.map((row, index) => (
                      <tr
                        key={row.id}
                        className={
                          row.productId === null ? "unsaved-row" : undefined
                        }
                      >
                        {/* ROW NUMBER */}
                        <td className="sheet-row-number">{index + 1}</td>

                        {/* CELLS */}
                        {sheetColumns.map((column) => {
                          const cellId = `${row.id}-${column.field}`;

                          return (
                            <td
                              key={column.field}
                              className={
                                activeCell === cellId
                                  ? "active-cell"
                                  : undefined
                              }
                              style={{ width: column.width }}
                            >
                              {column.multiline ? (
                                <textarea
                                  className="sheet-cell sheet-cell-textarea"
                                  placeholder={column.placeholder}
                                  value={row.draft[column.field]}
                                  onFocus={() => setActiveCell(cellId)}
                                  onBlur={() => setActiveCell(null)}
                                  onChange={(event) =>
                                    updateSheetCell(
                                      row.id,
                                      column.field,
                                      event.target.value,
                                    )
                                  }
                                />
                              ) : (
                                <Input
                                  className="sheet-cell"
                                  placeholder={column.placeholder}
                                  value={row.draft[column.field]}
                                  onFocus={() => setActiveCell(cellId)}
                                  onBlur={() => setActiveCell(null)}
                                  onChange={(event) =>
                                    updateSheetCell(
                                      row.id,
                                      column.field,
                                      event.target.value,
                                    )
                                  }
                                />
                              )}
                            </td>
                          );
                        })}

                        {/* ACTIONS */}
                        <td>
                          <div className="sheet-actions">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleSaveRow(row)}
                              disabled={busyRowId === row.id}
                            >
                              <Check className="size-4" />

                              {busyRowId === row.id ? "Saving..." : "Save"}
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleResetRow(row)}
                              disabled={busyRowId === row.id}
                            >
                              <RotateCcw className="size-4" />
                              Reset
                            </Button>

                            {row.productId === null ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => removeUnsavedRow(row.id)}
                              >
                                <X className="size-4" />
                                Remove
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (row.productId) {
                                    handleDeleteProduct(row.productId);
                                  }
                                }}
                                disabled={busyRowId === row.productId}
                              >
                                <Trash2 className="size-4" />

                                {busyRowId === row.productId
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
