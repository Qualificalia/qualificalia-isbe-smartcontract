# Registro de cambios

## Revisión de la documentación de ISBE — 16/11/2026

- Se ajustó el business ID al patrón de la plantilla oficial: `keccak256("isbe.customers.qualificalia.documentRegistry.resolver.key")`. ISBE debe confirmar disponibilidad y el uso de una facet propia frente a la oficial. El cambio modifica el bytecode y requiere una nueva compilación; esta versión aún no está desplegada.
- Se precisó que el control de acceso de ISBE puede conceder el rol a una EOA o a su DID. Se solicita inicialmente la EOA elegida por Qualificalia, sin concesión a otros DIDs o cuentas; un administrador podría modificarlo posteriormente.
- Se reflejó que Qualificalia comunica el registro del DID en PRE, aún sin verificación independiente desde este proyecto.
- Se fijaron finales de línea LF para las fuentes y artefactos, se regeneraron los archivos de entrega y se añadió una comprobación de igualdad con el build.
- Sigue pendiente confirmar con ISBE la configuración Diamond, roles de administración/pausa, versión de biblioteca admitida y procedimiento de despliegue. Las pruebas locales no reproducen la gobernanza real.
