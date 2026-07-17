# HORUS — Registro de Cambios

## v1.0.0 — Versión Inicial Completa

### Arquitectura del Sitio

```
horus_store/
├── index.html              # Landing page con partículas + slider 3D
├── css/style.css           # Sistema de estilos con 3 modos horarios
├── js/app.js               # Aplicación completa (488 líneas)
├── vercel.json             # Configuración para deploy en Vercel
├── CHANGELOG.md            # Este documento
└── pages/
    ├── admin.html          # Panel de administración CRUD
    ├── shop.html           # Tienda con filtros y COP
    ├── gallery.html        # Galería visual de trabajos
    ├── customize.html      # Personalizador de camisetas
    ├── cart.html           # Carrito de compras
    ├── checkout.html       # Checkout completo
    ├── orders.html         # Historial de pedidos con tracking
    └── contact.html        # Página de contacto
```

---

### 1. Sistema de Modo Horario (Tema Dinámico)

El sitio cambia automáticamente de estilo según la hora del día:

| Horario | Rango | Modo | Paleta |
|---------|-------|------|--------|
| 🌅 Mañana | 6:00 - 12:00 | `mode-morning` | Fondo claro, dorado suave, texto oscuro |
| ☀️ Tarde | 12:01 - 18:59 | `mode-afternoon` | Fondo cobrizo, naranja-dorado, cálido |
| 🌙 Noche | 19:00 - 5:59 | `mode-night` | Fondo oscuro, dorado clásico |

**Archivos involucrados:**
- `css/style.css` — Definición de variables CSS para cada modo (`:root` + `body.mode-*`)
- `js/app.js` — Lógica en `(function setTimeMode())` y `getTimeModeLabel()`
- Todas las páginas HTML — Indicador visual con `#timeIndicator`

---

### 2. Slider 3D de Productos

Carrusel de productos con efecto tridimensional en la página principal.

**Características:**
- 5 posiciones en el eje Z: `active`, `left`, `right`, `far-left`, `far-right`
- Efectos de rotación (`rotateY`), escala (`scale`) y opacidad
- Auto-play cada 4 segundos
- Click en tarjeta central: agrega al carrito
- Click en tarjeta lateral: navega hacia ella
- Controles manuales (‹ ›)
- Totalmente responsive

**Archivos:**
- `css/style.css` — `.slider-card`, `.slider-card.active/left/right/far-left/far-right`, `.slider-controls`
- `js/app.js` — `initSlider()`, `renderSlider()`, `slideNext()`, `slidePrev()`
- `index.html` — Sección con `#sliderStage`

---

### 3. Partículas Animadas en Hero

Fondo interactivo con partículas conectadas en el hero section.

**Características:**
- 80 partículas flotando con movimiento Browniano
- Conexiones entre partículas cercanas (<150px)
- Color dorado que se adapta al tema horario
- Rendimiento optimizado con `requestAnimationFrame`
- Redimensionamiento automático del canvas

**Archivos:**
- `js/app.js` — `initParticles()`
- `index.html` — `<canvas id="particles-canvas">`

---

### 4. Panel de Administración CRUD

Panel completo para gestionar productos desde el navegador.

**Ruta:** `/pages/admin.html`

**Características:**
- **Crear:** formulario con nombre, tipo, categoría, precio COP, emoji, descripción
- **Leer:** listado de todos los productos con botones de acción
- **Actualizar:** edición en el mismo formulario con detección automática
- **Eliminar:** confirmación antes de borrar
- Persistencia en `localStorage`
- Validación de campos requeridos
- Cancelación de edición

**Archivos:**
- `js/app.js` — `getProducts()`, `saveProducts()`, `addProduct()`, `updateProduct()`, `deleteProduct()`, `initAdmin()`, `editProduct()`, `deleteProductConfirm()`
- `pages/admin.html` — Interfaz completa con formulario y listado

---

### 5. Precios en Pesos Colombianos (COP)

Todo el sistema de precios convertido a COP.

| Concepto | EUR | COP |
|----------|-----|-----|
| Precio base camisetas | €24.90 - €44.90 | $104.000 - $188.000 |
| Envío gratis desde | €50 | $210.000 |
| Envío estándar | €4.90 | $20.000 |
| Cupón SEGUIDOR | €5 | $21.000 |

**Archivos:**
- `js/app.js` — `formatCOP()`, `EXCHANGE_RATE = 4200`
- Todas las páginas que muestran precios

---

### 6. Sistema de Ecommerce Completo

| Funcionalidad | Archivo | Descripción |
|---|---|---|
| Carrito persistente | `localStorage` | `horus_cart` en localStorage |
| Cupones de descuento | `js/app.js` | `HORUS10` (10%), `SEGUIDOR` ($21K), `TIKTOK` (15%) |
| Checkout completo | `pages/checkout.html` | Datos de envío, métodos de pago |
| Historial de pedidos | `pages/orders.html` | Tracking: pendiente → procesando → enviado → entregado |
| Integración WhatsApp | Todas | Pedidos y consultas vía WhatsApp |
| Envío gratis automático | `js/app.js` | +$210.000 COP |

---

### 7. Efectos Visuales y UX

- **Hero flash animado** con `pulse-glow`
- **Gradiente animado** en títulos con `gradient-shift`
- **Scroll reveal** con `IntersectionObserver`
- **Contadores animados** (seguidores, ventas, satisfacción)
- **Hover cinematográfico** en tarjetas con barrido de luz (`.feature-card::after`)
- **Quick view modal** para productos
- **Toast notifications** para feedback de usuario
- **Vista rápida** en tienda

---

### 8. Integración con Redes Sociales

- TikTok: enlace directo y cards simuladas
- Instagram: enlace en footer y header
- WhatsApp: botones de acción, checkout, contacto
- Indicador de tiempo que saluda según la hora

---

### 9. Deploy

**Plataforma:** Vercel
**Archivo de configuración:** `vercel.json`

```json
{
  "version": 2,
  "builds": [{ "src": "**/*", "use": "@vercel/static" }],
  "routes": [{ "src": "/(.*)", "dest": "/$1" }]
}
```

**URL:** https://horus-store.vercel.app (o la que asigne Vercel)

---

### 10. Estructura de Datos (Producto)

```javascript
{
  id: "p1",                    // ID único
  name: "Yoshi Bleach",       // Nombre del producto
  type: "Bleach Art",         // Tipo/técnica
  price: 125000,              // Precio en COP
  priceEUR: 29.90,            // Precio de referencia en EUR
  image: "☠️",                // Emoji representativo
  category: "bleach",         // Categoría para filtros
  popular: true,              // Destacado
  desc: "Descripción..."      // Descripción detallada
}
```

---

### Pendientes para futuras versiones

- [ ] Subida de imágenes reales (no emojis)
- [ ] Autenticación en el panel admin
- [ ] Pasarela de pago real (Mercado Pago, Wompi, etc.)
- [ ] Integración con base de datos (Firebase/Supabase)
- [ ] Página de producto individual
- [ ] SEO mejorado con meta tags dinámicos
- [ ] Modo oscuro/claro manual (toggle)
- [ ] Multi-idioma (ES/EN)

---

*Documento generado el 17 de julio de 2026*
*HORUS — Arte y creatividad sobre tela*
