/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/remittance.json`.
 */
export type Remittance = {
  "address": "72citsVT8pcy5orD5HVAS9UN1aBspCkui1NmcGAB8Xsg",
  "metadata": {
    "name": "remittance",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "SolPayX remittance smart contract"
  },
  "instructions": [
    {
      "name": "sendRemittance",
      "discriminator": [
        58,
        184,
        30,
        1,
        90,
        156,
        238,
        87
      ],
      "accounts": [
        {
          "name": "sender",
          "writable": true,
          "signer": true
        },
        {
          "name": "senderTokenAccount",
          "writable": true
        },
        {
          "name": "recipientTokenAccount",
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "memo",
          "type": "string"
        }
      ]
    }
  ],
  "events": [
    {
      "name": "remittanceEvent",
      "discriminator": [
        174,
        3,
        121,
        151,
        250,
        227,
        101,
        99
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidAmount",
      "msg": "Amount must be greater than zero"
    },
    {
      "code": 6001,
      "name": "memoTooLong",
      "msg": "Memo must be 100 characters or less"
    }
  ],
  "types": [
    {
      "name": "remittanceEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sender",
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "fee",
            "type": "u64"
          },
          {
            "name": "memo",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
