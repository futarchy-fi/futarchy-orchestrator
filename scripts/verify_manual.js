const hre = require("hardhat");

async function main() {
    const ORG_FACTORY_ADDR = "0x98965924fb960E1c1f75a53d98e601Be23CDEFFB";
    const ORG_IMPL = "0x125043a89E0D3f030f8dbfBDCA51Fc0C04fF2d43";
    const PROP_IMPL = "0xB30C780AbD2059541A5e4C24Ca8DB53F0008e147";

    console.log("Verifying OrganizationMetadataFactory...");
    try {
        await hre.run("verify:verify", {
            address: ORG_FACTORY_ADDR,
            constructorArguments: [ORG_IMPL, PROP_IMPL],
        });
        console.log("✅ Verification Successful");
    } catch (e) {
        console.error("❌ Verification Failed:");
        console.error(e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
