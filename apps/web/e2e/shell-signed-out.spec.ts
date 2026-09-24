import { describeShellContract } from "./shell-contract";

// The two routes an authenticated visitor is redirected away from, so the shell
// contract can only be checked on them with no session.
describeShellContract(["sign-in", "register"]);
