# Solicitud de revisión y despliegue en PRE

- **Entidad:** Qualificalia.
- **DID empresarial PRE:** `did:isbe:uc-pre:z19bWuvt29yk7NLBycEdMefJse9x`.
- **EOA PRE solicitada para firmar los registros:** `0xb26f4BbDa0ef99928C0c9F9239e7bE73ADA1be91`.
- **Caso de uso:** registrar y consultar las huellas SHA-256 independientes de certificados PDF y credenciales digitales firmadas.

Los identificadores figuran en el documento local de identidad pública PRE proporcionado por el titular; este repositorio no acredita su registro, vigencia ni permisos en la red. La EOA indicada es la dirección elegida por Qualificalia para firmar y sufragar los registros en PRE.

## Para el equipo ISBE

1. Revisar [`QualificaliaHashTimestampFacet.sol`](contracts/QualificaliaHashTimestampFacet.sol), versión de dependencias, licencia y parámetros de compilación del README.
2. Confirmar el business ID de la facet, versión de biblioteca y configuración Diamond que debe utilizarse, y si esta facet debe reemplazar a HashTimestamp oficial en esa configuración.
3. Asociar el caso de uso al DID indicado y configurar el permiso de escritura para la EOA indicada; comprobar los permisos efectivos, incluidos los posibles permisos otorgados a DIDs o administradores. El contrato no limita por sí solo el rol a esa EOA.
4. Componer y desplegar el caso de uso en PRE conforme a la gobernanza ISBE y confirmar cómo se aprovisiona el gas.
5. Facilitar la dirección del Diamond, red/chain ID, ABI y facetas activas, versión/configuración, rol efectivo, acceso RPC y procedimiento de verificación y pausa.

El proyecto no contiene un script de despliegue para PRE ni pretende sustituir el procedimiento de ISBE. Si se requiere un script o un formato concreto de artefactos, facilitad la interfaz y versión requeridas. El README explica cómo generar el Standard JSON Input y reproducir el bytecode; los harnesses sirven solo para pruebas locales. El resultado local no demuestra por sí solo el funcionamiento del DID ni de la gobernanza real.
