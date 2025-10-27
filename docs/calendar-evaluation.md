# Evaluación de librerías de calendario para React + Tailwind

Se revisaron varias opciones populares que ofrecen componentes de calendario listos para usar.

## FullCalendar React
- ✅ Muy completo en cuanto a vistas (día, semana, mes) y funcionalidad.
- ✅ Excelente soporte para arrastrar y redimensionar eventos.
- ⚠️ Estilos propios basados en CSS plano; integrar Tailwind requiere sobrescribir muchos estilos.
- ⚠️ Tamaño de bundle elevado y API extensa para un caso de uso relativamente sencillo.

## React Big Calendar
- ✅ API declarativa y basada en objetos de JavaScript.
- ✅ Permite personalizar componentes internos.
- ⚠️ Necesita moment.js o date-fns como dependencia externa.
- ⚠️ El theming con Tailwind demanda wrappers o CSS adicional.

## React Day Picker
- ✅ Ligero y compatible con Tailwind.
- ⚠️ Orientado a selección de fechas, no a la visualización de reservas con franjas horarias.

**Conclusión:** dadas las dependencias mínimas del proyecto y la necesidad de integrar reglas de negocio personalizadas (validación de solapamientos, horarios dinámicos por espacio, integración con el modal existente), se optó por un componente propio dentro de `src/components`/`src/pages` que reutiliza la lógica de los contextos actuales.
