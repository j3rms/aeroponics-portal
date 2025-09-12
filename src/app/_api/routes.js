const url = () => {
  return process.env.NEXT_PUBLIC_URL;
};
const tokenUrl = () => {
  return process.env.NEXT_PUBLIC_OAUTH_URL;
};

const publicUrl = () => {
  return process.env.NEXT_PUBLIC_PUBLIC_API_URL;
};

const externalUrl = () => {
  return process.env.NEXT_PUBLIC_EXTERNAL_URL;
};

export { url, tokenUrl, publicUrl, externalUrl };

export async function GET() {
  return Response.json([
    { name: "SPINACH", image: "spinach.png" },
    { name: "CABBAGE", image: "cabbage.png" },
    { name: "LETTUCE", image: "lettuce.png" },
    { name: "TOMATOES", image: "tomatoes.png" },
  ]);
}

