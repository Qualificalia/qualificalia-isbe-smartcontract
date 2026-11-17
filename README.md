# Qualificalia — registro de huellas en ISBE

Propuesta para revisión y despliegue por ISBE de un registro de huellas de certificados y credenciales de Qualificalia. La fuente a desplegar es [`contracts/QualificaliaHashTimestampFacet.sol`](contracts/QualificaliaHashTimestampFacet.sol). El proyecto no contiene claves ni datos de alumnos.

## Datos para ISBE PRE

- **DID empresarial:** `did:isbe:uc-pre:z19bWuvt29yk7NLBycEdMefJse9x`.
- **Cuenta propuesta para firmar las transacciones:** `0xb26f4BbDa0ef99928C0c9F9239e7bE73ADA1be91`.
- Qualificalia comunica que ha registrado el DID en PRE. La cuenta elegida debe recibir el permiso de escritura; el registro y los permisos no se han verificado desde este proyecto.
- La persona responsable de ISBE debe confirmar la versión de biblioteca, el business ID, la composición Diamond, los roles de administración/pausa, el aprovisionamiento de gas y el procedimiento de despliegue. Tras desplegar, se necesitan la dirección del Diamond, red, ABI, configuración, roles efectivos y acceso RPC.

Qualificalia calcula fuera de cadena un SHA-256 para cada PDF firmado y para cada credencial digital firmada, sobre los bytes finales. Envía una transacción por huella; el titular no necesita cuenta blockchain. La correspondencia entre archivos, personas y huellas se conserva fuera de cadena.

| Función | Resultado |
| --- | --- |
| `timestampHash(bytes32)` | Registra una huella nueva si el remitente tiene el rol y la escritura no está pausada; emite `HashTimestamped`. |
| `exists(bytes32)` | Indica si la huella existe. |
| `getTimestamp(bytes32)` | Devuelve la marca de tiempo del bloque que la registró; cero indica ausencia. |

Las lecturas mediante una llamada de consulta no consumen gas al usuario. El contrato rechaza registros duplicados. Si dos archivos tienen los mismos bytes, tienen la misma huella y comparten el registro original; la aplicación debe verificar la evidencia existente. La fecha es la del bloque y no un sello de tiempo cualificado. El hash registrado no prueba por sí solo la validez, firma o ausencia de revocación del archivo. El backend debe rechazar `bytes32(0)`; la lógica oficial lo admite.

## Integración con ISBE

La facet hereda la lógica oficial `HashTimestamp` de `@red-isbe/isbe-contracts` 0.2.1. Incluye introspección de la interfaz y los tres selectores. La facet es un módulo de un Diamond de ISBE, no un registro autónomo. Comparte selectores y almacenamiento con la facet `HashTimestampFacet` oficial; debe sustituirla en la misma configuración, no coexistir con ella.

La facet propone el business ID `keccak256("isbe.customers.qualificalia.documentRegistry.resolver.key")`, que produce `0x1731c65d9dd332bcfd4ee398add0a7f786149f91a2dd48abc865b4ebeff1bb3b`. La cadena sigue la convención de nombres de la [plantilla oficial ISBE](https://github.com/red-isbe/isbe-clients-template/blob/fa7e8b9966d6be69c498264eaf069aaca361eea3/README.md#3-define-your-namespace-and-constants). El ID identifica la facet, no el DID ni la dirección de Qualificalia. Es una propuesta: ISBE debe confirmar su disponibilidad y si corresponde registrar una facet propia o utilizar directamente la oficial. Un ID diferente no añade funcionalidad a la lógica oficial. La configuración ISBE debe referirse exactamente al mismo ID que devuelve la facet.

El rol de escritura es `_HASH_TIMESTAMP_ROLE` (`0x3bb8341caefb6dc4800c130d6d6d2789f8c4e534bc168ff9a7eda2e2831a721f`). La lógica oficial consulta el control de acceso del Diamond: **no fija una dirección en el código**. Solicitar la asignación inicial a la EOA indicada arriba, sin asignar el rol de escritura a otros DIDs o cuentas, y verificar los permisos efectivos. En la versión 0.2.1 se comprueban tanto el rol de la EOA como el del DID al que se resuelve, por lo que concederlo a un DID puede habilitar otras cuentas vinculadas. Un administrador de roles puede modificar esas autorizaciones. La administración de roles y la pausa se configuran mediante la gobernanza ISBE.

El almacenamiento de HashTimestamp usa el slot oficial `0x9461e6f53daf5c3d0aa4d10025e40b84fad06da43fb4fab1a98f3e6b3a58d616`, con un `mapping(bytes32 => uint256)` de huella a timestamp. Las facetas de gobernanza utilizan además sus propios slots oficiales. Los cambios futuros deben preservar compatibilidad de almacenamiento.

## Compilación y pruebas

Requisitos: Node.js 20 o superior y npm. Desde este directorio:

```sh
npm ci --ignore-scripts
npm test
npm run verify:delivery
```

Se fijan `solc` 0.8.28, optimizador de 200 pasadas, EVM `istanbul` y las dependencias en `package-lock.json`. `npm run compile` genera en `build/` ABI, bytecode, metadatos y `standard-input.json`, que contiene las fuentes exactas de las dependencias usadas. El compilador comprueba que ese input reproduce el bytecode. La carpeta `entrega/` conserva el input completo y el artefacto de la facet generados para esta versión; `build/` es local y no se versiona.

`npm run verify:delivery` recompila y comprueba que ambos archivos de `entrega/` coinciden con el resultado. `.gitattributes` fija finales de línea LF en las fuentes para que su contenido y metadatos de compilación sean consistentes entre sistemas.

La revisión de dependencias con `npm audit` del 16/11/2026 muestra 18 avisos: 13 bajos, 3 moderados y 2 altos (`serialize-javascript` y `tmp`) en el árbol de herramientas y dependencias del proyecto. No se ha evaluado su explotación en este uso concreto. Los cambios mayores que sugiere npm pueden alterar la versión de referencia ISBE o el entorno de pruebas; deben revisarse con el equipo antes de adoptarlos. Estos avisos no son un análisis del contrato Solidity.

El repositorio tiene CI propio para ejecutar las pruebas, verificar la entrega y auditar dependencias con umbral `critical`; los avisos de severidad inferior deben revisarse igualmente. Dependabot propone actualizaciones semanales de npm y GitHub Actions, que requieren revisión antes de cambiar las versiones fijadas.

Las pruebas ejecutan la lógica en Hardhat en memoria y comprueban registro de dos huellas, consulta, duplicados, permisos y pausa. `test/QualificaliaHashTimestampHarness.sol` es una simulación exclusivamente local: no reproduce el DID, Diamond ni la gobernanza de ISBE y no debe desplegarse en PRE o producción. Se recomienda además ensayar con la [red local oficial de ISBE](https://docs.redisbe.com/documentation/smart-contracts/guias-practicas/red-local/) y confirmar con ISBE su procedimiento de integración y despliegue.

## Estado

El código se entrega para revisión técnica de ISBE. La aceptación del business ID, la versión admitida, la composición del Diamond, los permisos y su vinculación a la identidad corporativa requieren confirmación de ISBE. La [guía de contratos custom](https://docs.redisbe.com/documentation/smart-contracts/contratos-custom/) contempla además scripts de despliegue, pruebas de integración, cobertura y análisis estático; este proyecto aún no incorpora esas evidencias y debe acordar con ISBE el procedimiento aplicable. El emisor de Wallet Profile debe integrarse con el Diamond una vez conocido el despliegue. Los cambios se documentan en [CAMBIOS.md](CAMBIOS.md).

Código bajo licencia Apache-2.0; `HashTimestamp` y otras dependencias mantienen sus licencias y atribuciones originales.
