# Registro de huellas para ISBE

Facet de Qualificalia para registrar y consultar las huellas de certificados y credenciales. El contrato para revisión es [`contracts/QualificaliaHashTimestampFacet.sol`](contracts/QualificaliaHashTimestampFacet.sol).

## Funciones

- `timestampHash(bytes32)`: registra una huella y emite el evento `HashTimestamped` con la cuenta y la fecha del bloque. Requiere el rol de escritura y que el contrato no esté pausado.
- `exists(bytes32)`: comprueba si la huella existe.
- `getTimestamp(bytes32)`: devuelve la fecha del registro, o cero si no existe.

La lógica de `HashTimestamp` rechaza duplicados y acepta `bytes32(0)`; el emisor debe rechazar valores nulos y calcular cada SHA-256 sobre los bytes finales firmados. La huella no prueba por sí sola la validez, firma o revocación del documento.

## Configuración ISBE

- DID de Qualificalia en PRE: `did:isbe:uc-pre:z19bWuvt29yk7NLBycEdMefJse9x`.
- Dirección pública de la cartera solicitada para registrar huellas en PRE: `0xb26f4BbDa0ef99928C0c9F9239e7bE73ADA1be91`.
- Dependencia: `@red-isbe/isbe-contracts` **0.2.1**, con almacenamiento y lógica oficiales de `HashTimestamp`.
- Business ID propuesto: `keccak256("isbe.customers.qualificalia.documentRegistry.resolver.key")` = `0x1731c65d9dd332bcfd4ee398add0a7f786149f91a2dd48abc865b4ebeff1bb3b`.
- Rol de escritura: `_HASH_TIMESTAMP_ROLE` = `0x3bb8341caefb6dc4800c130d6d6d2789f8c4e534bc168ff9a7eda2e2831a721f`. Se solicita concederlo inicialmente solo a la dirección indicada arriba. El contrato admite permisos por cuenta o DID; hay que comprobar los permisos efectivos.
- Slot de almacenamiento: `0x9461e6f53daf5c3d0aa4d10025e40b84fad06da43fb4fab1a98f3e6b3a58d616`, con `mapping(bytes32 => uint256)`. La facet comparte selectores y almacenamiento con la `HashTimestampFacet` oficial; deben evitarse conflictos en la configuración.

La facet se integra en un Diamond de ISBE. La composición debe incluir el control de roles y pausa.

## Compilación y pruebas

Node.js 20 o superior y npm:

```sh
npm ci --ignore-scripts
npm test
npm run verify:delivery
```

Compilador Solidity **0.8.28**, optimización **200**, EVM **istanbul**. [`compilacion/`](compilacion/) contiene el artefacto y el Standard JSON Input con las fuentes exactas. `verify:delivery` recompila y comprueba que ambos coinciden con la entrega.

Las pruebas utilizan un harness local con roles simulados; no validan el Diamond ni el DID real. Quedan pendientes las pruebas de integración, el análisis estático y la cobertura. La auditoría de dependencias del 16/11/2026 detectó dos avisos altos en herramientas (`serialize-javascript` y `tmp`), pendientes de revisión.

Licencia Apache-2.0; las dependencias conservan sus licencias y atribuciones.
