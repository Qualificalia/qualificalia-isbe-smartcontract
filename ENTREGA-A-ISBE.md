# Solicitud de revisión y despliegue en PRE

- **Entidad:** Qualificalia.
- **DID empresarial PRE:** `did:isbe:uc-pre:z19bWuvt29yk7NLBycEdMefJse9x`.
- **EOA PRE solicitada para firmar los registros:** `0xb26f4BbDa0ef99928C0c9F9239e7bE73ADA1be91`.
- **Caso de uso:** registrar y consultar las huellas SHA-256 independientes de certificados PDF y credenciales digitales firmadas.

Los identificadores figuran en el documento local de identidad pública PRE proporcionado por el titular. Qualificalia comunica que ha registrado su DID en PRE; este repositorio no verifica de forma independiente el registro, la vigencia ni los permisos. La EOA indicada es la dirección elegida por Qualificalia para firmar y aportar el gas técnico de los registros en PRE. La [documentación de parámetros de red](https://docs.redisbe.com/documentation/infraestructura/arquitectura-red/parametros-red/) describe el gas como mecanismo de control y señala que no tiene coste económico por transacción; confirmar el aprovisionamiento de PRE con ISBE.

## Para el equipo ISBE

1. Revisar [`QualificaliaHashTimestampFacet.sol`](contracts/QualificaliaHashTimestampFacet.sol), versión de dependencias, licencia y parámetros de compilación del README.
2. Confirmar el business ID propuesto (`0x1731c65d9dd332bcfd4ee398add0a7f786149f91a2dd48abc865b4ebeff1bb3b`), versión de biblioteca y configuración Diamond que debe utilizarse, y si corresponde utilizar la facet propuesta o la oficial HashTimestamp.
3. Asociar el caso de uso al DID indicado y configurar el permiso de escritura exclusivamente para la EOA indicada; no asignar el rol de escritura a otros DIDs o cuentas. Comprobar los permisos efectivos, incluidos permisos derivados de DID. El contrato no limita por sí solo el rol a esa EOA y un administrador puede modificarlo. Acordar las cuentas y roles de administración y pausa que necesita la configuración ISBE.
4. Componer y desplegar el caso de uso en PRE conforme a la gobernanza ISBE y confirmar cómo se aprovisiona el gas.
5. Facilitar la dirección del Diamond, red/chain ID, ABI y facetas activas, versión/configuración, rol efectivo, acceso RPC y procedimiento de verificación y pausa.

El proyecto no contiene un script de despliegue para PRE ni pretende sustituir el procedimiento de ISBE. Si se requiere un script o un formato concreto de artefactos, facilitad la interfaz y versión requeridas. El README explica cómo generar el Standard JSON Input y reproducir el bytecode; los harnesses sirven solo para pruebas locales. El resultado local no demuestra por sí solo el funcionamiento del DID ni de la gobernanza real.
