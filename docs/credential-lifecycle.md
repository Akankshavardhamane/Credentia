# Credential lifecycle

Allowed transitions: `active → suspended | revoked | expired | superseded`; `suspended → active | revoked | expired | superseded`. `revoked`, `expired`, and `superseded` are terminal. Supersession links the old credential to a replacement without destroying its evidence or history.

`POST /credentials/:id/status` enforces these transitions. Supersession creates a new VC with a higher `credentialVersion` and `supersedesCredentialId`; the original keeps `supersededByCredentialId` and remains retrievable for historical verification, but its status evidence is not valid.
