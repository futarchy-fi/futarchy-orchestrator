const hre = require("hardhat");

async function main() {
    const artifact = await hre.artifacts.readArtifact("OrganizationMetadataFactory");
    const implFragment = artifact.abi.find(x => x.name === "implementation");
    console.log("ABI Element for 'implementation':", implFragment);

    // Also check storage layout (if possible via hardhat-storage-layout, but manually we can't easily).
    // Let's try to verify with likely correct addresses if we can find them.
    // We can find them by looking at the TRANSATION INPUT DATA of the factory deployment if we had the tx hash.
    // But we have the address. We can lookup the contract creation code? No, simple scripts are better.
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
