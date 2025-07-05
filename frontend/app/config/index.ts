import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";
import { http } from "wagmi";

export const projectId = "8e67a983dade6ab3c075fe3c0d72e914";

const localhost = {
  id: 31337,
  name: "Anvil",
  network: "localhost",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
  testnet: true,
};

export const wagmiConfig = getDefaultConfig({
  appName: "Life Ledger",
  projectId,
  chains: [mainnet, sepolia, localhost],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [localhost.id]: http("http://127.0.0.1:8545"),
  },
});
