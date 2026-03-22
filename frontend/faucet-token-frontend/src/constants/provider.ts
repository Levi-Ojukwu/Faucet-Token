import { JsonRpcProvider } from "ethers";

export const jsonRpcProvider = new JsonRpcProvider(
    import.meta.env.VITE_LISK_TESTNET_RPC_URL
);

