# Qualificalia — registro de huellas en ISBE

Propuesta para revisión y despliegue por ISBE de un registro de huellas de certificados y credenciales de Qualificalia. La fuente principal es [`QualificaliaHashTimestampFacet.sol`](contracts/QualificaliaHashTimestampFacet.sol). El proyecto no contiene claves ni datos de alumnos.

Qualificalia calcula fuera de cadena un SHA-256 para cada PDF firmado y para cada credencial digital firmada, sobre los bytes finales. Envía una transacción por huella; el titular no necesita cuenta blockchain. La correspondencia entre archivos, personas y huellas se conserva fuera de cadena.

| Función | Resultado |
| --- | --- |
| `timestampHash(bytes32)` | Registra una huella nueva si el remitente tiene el rol y la escritura no está pausada; emite `HashTimestamped`. |
| `exists(bytes32)` | Indica si la huella existe. |
| `getTimestamp(bytes32)` | Devuelve la marca de tiempo del bloque que la registró; cero indica ausencia. |

Las lecturas mediante una llamada de consulta no consumen gas al usuario. El contrato rechaza registros duplicados. Si dos archivos tienen los mismos bytes, tienen la misma huella y comparten el registro original; la aplicación debe verificar la evidencia existente. La fecha es la del bloque y no un sello de tiempo cualificado. El hash registrado no prueba por sí solo la validez, firma o ausencia de revocación del archivo. El backend debe rechazar `bytes32(0)`; la lógica oficial lo admite.

## Integración con ISBE

La facet hereda la lógica oficial `HashTimestamp` de `@red-isbe/isbe-contracts` 0.2.1. Incluye introspección de la interfaz y los tres selectores. La facet es un módulo de un Diamond de ISBE, no un registro autónomo. Comparte selectores y almacenamiento con la facet `HashTimestampFacet` oficial; debe sustituirla en la misma configuración, no coexistir con ella.

La facet propone el business ID `keccak256("com.qualificalia.isbe.certificate-credential-hash-timestamp.v1")`. Es una etiqueta para identificar y versionar la facet en la infraestructura de ISBE; no es el DID ni la dirección de Qualificalia. Es provisional: la persona desplegadora debe confirmar si acepta ese ID o requiere el oficial. Un ID diferente no añade funcionalidad a la lógica oficial.

El rol de escritura es `_HASH_TIMESTAMP_ROLE` (`0x3bb8341caefb6dc4800c130d6d6d2789f8c4e534bc168ff9a7eda2e2831a721f`). La lógica oficial consulta el control de acceso del Diamond: **no fija una dirección en el código**. Solicitar la asignación inicial indicada en [ENTREGA-A-ISBE.md](ENTREGA-A-ISBE.md) y verificar que ninguna otra cuenta o DID tenga permiso de escritura salvo lo acordado. La administración de roles y la pausa se configuran mediante la gobernanza ISBE.

El almacenamiento de HashTimestamp usa el slot oficial `0x9461e6f53daf5c3d0aa4d10025e40b84fad06da43fb4fab1a98f3e6b3a58d616`, con un `mapping(bytes32 => uint256)` de huella a timestamp. Las facetas de gobernanza utilizan además sus propios slots oficiales. Los cambios futuros deben preservar compatibilidad de almacenamiento.

## Compilación y pruebas

Requisitos: Node.js 20 o superior y npm. Desde este directorio:

```sh
npm ci --ignore-scripts
npm test
```

Se fijan `solc` 0.8.28, optimizador de 200 pasadas, EVM `istanbul` y las dependencias en `package-lock.json`. `npm run compile` genera en `build/` ABI, bytecode, metadatos y `standard-input.json`, que contiene las fuentes exactas de las dependencias usadas. El compilador comprueba que ese input reproduce el bytecode. La carpeta `entrega/` conserva el input completo y el artefacto de la facet generados para esta versión; `build/` es local y no se versiona.

La revisión de dependencias con `npm audit` del 16/11/2026 muestra 18 avisos: 13 bajos, 3 moderados y 2 altos (`serialize-javascript` y `tmp`) en el árbol de herramientas y dependencias del proyecto. No se ha evaluado su explotación en este uso concreto. Los cambios mayores que sugiere npm pueden alterar la versión de referencia ISBE o el entorno de pruebas; deben revisarse con el equipo antes de adoptarlos. Estos avisos no son un análisis del contrato Solidity.

Las pruebas ejecutan la lógica en Hardhat en memoria y comprueban registro de dos huellas, consulta, duplicados, permisos y pausa. Los contratos `*Harness.sol` son simulaciones exclusivamente locales: no reproducen el DID, Diamond ni la gobernanza de ISBE y no deben desplegarse en PRE o producción. Se recomienda además ensayar con la [red local oficial de ISBE](https://docs.redisbe.com/documentation/smart-contracts/guias-practicas/red-local/) y confirmar con ISBE su procedimiento de integración y despliegue.

## Estado

El código se entrega para revisión técnica de ISBE. La aceptación del business ID, la versión admitida, la composición del Diamond, los permisos y su vinculación a la identidad corporativa requieren confirmación de ISBE. El emisor de Wallet Profile debe integrarse con el Diamond una vez conocido el despliegue. Véase [ENTREGA-A-ISBE.md](ENTREGA-A-ISBE.md).

Código bajo licencia Apache-2.0; `HashTimestamp` y otras dependencias mantienen sus licencias y atribuciones originales.
