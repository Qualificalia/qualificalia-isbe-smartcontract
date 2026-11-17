# Registro de cambios

## Nombres más claros — 17/11/2026

- Se cambió el nombre de la carpeta `entrega/` a `compilacion/` para identificar su contenido: el artefacto compilado y los datos necesarios para reproducirlo. Se ajustaron el README y la comprobación de coincidencia.

## Simplificación de la entrega — 17/11/2026

- Se concentraron las instrucciones y datos para ISBE en el README y se retiraron el documento duplicado de entrega y la suite comparativa de la facet oficial.
- Se conservan y agrupan las pruebas de la facet de Qualificalia, incluido el control simulado de permisos y pausa. El harness se encuentra en `test/` para identificarlo como prueba.
- Se regeneraron los artefactos de entrega con las fuentes necesarias para compilar la facet y su harness de prueba. Los pendientes de integración, seguridad y despliegue constan en el README.

## Separación del proyecto — 17/11/2026

- El proyecto se ubicó junto al resto de proyectos de contratos, fuera del checkout de Wallet Profile, conservando su repositorio Git y remoto propios.
- Se añadieron un workflow de comprobaciones y auditoría de dependencias y una configuración Dependabot al repositorio independiente. La auditoría CI bloquea vulnerabilidades críticas; los avisos altos documentados necesitan seguimiento propio.

## Revisión de la documentación de ISBE — 16/11/2026

- Se ajustó el business ID al patrón de la plantilla oficial: `keccak256("isbe.customers.qualificalia.documentRegistry.resolver.key")`. ISBE debe confirmar disponibilidad y el uso de una facet propia frente a la oficial. El cambio modifica el bytecode y requiere una nueva compilación; esta versión aún no está desplegada.
- Se precisó que el control de acceso de ISBE puede conceder el rol a una EOA o a su DID. Se solicita inicialmente la EOA elegida por Qualificalia, sin concesión a otros DIDs o cuentas; un administrador podría modificarlo posteriormente.
- Se reflejó que Qualificalia comunica el registro del DID en PRE, aún sin verificación independiente desde este proyecto.
- Se fijaron finales de línea LF para las fuentes y artefactos, se regeneraron los archivos de entrega y se añadió una comprobación de igualdad con el build.
- Sigue pendiente confirmar con ISBE la configuración Diamond, roles de administración/pausa, versión de biblioteca admitida y procedimiento de despliegue. Las pruebas locales no reproducen la gobernanza real.
