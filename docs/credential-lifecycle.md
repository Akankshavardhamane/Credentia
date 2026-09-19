# Credential lifecycle

Allowed transitions: `active → suspended | revoked | expired | superseded`; `suspended → active | revoked | expired | superseded`. `revoked`, `expired`, and `superseded` are terminal. Supersession links the old credential to a replacement without destroying its evidence or history.
