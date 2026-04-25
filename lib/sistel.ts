const SISTEL_BASE = process.env.SISTEL_URL!;
const SISTEL_USER = process.env.SISTEL_USER!;
const SISTEL_PASS = process.env.SISTEL_PASS!;

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry - 30_000) return cachedToken;

  const res = await fetch(`${SISTEL_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: SISTEL_USER, password: SISTEL_PASS }),
  });

  if (!res.ok) throw new Error(`Sistel auth failed: ${res.status}`);

  const data = await res.json();
  const token: string = data.accessToken ?? data.token ?? data.access_token;
  if (!token) throw new Error("Sistel auth: no token in response");

  const payload = JSON.parse(
    Buffer.from(token.split(".")[1], "base64").toString()
  );
  cachedToken = token;
  tokenExpiry = payload.exp * 1000;
  return token;
}

export interface SistelListResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

export async function sistelGet<T>(
  alias: string,
  params?: Record<string, string>
): Promise<SistelListResponse<T>> {
  const token = await getToken();
  const url = new URL(`${SISTEL_BASE}/vistas/${alias}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Sistel GET /vistas/${alias}: ${res.status}`);
  return res.json();
}

export async function sistelPost<T>(path: string, body: unknown): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${SISTEL_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Sistel POST ${path}: ${res.status}`);
  return res.json();
}

export interface SistelCliente {
  ID: number;
  RazonSocial: string;
  CondicionIva: string;
  CUIT: string;
  Email: string;
  Domicilio: string;
  Localidad: string;
  Provincia: string;
}

export interface SistelArticulo {
  CodArticulo: string;
  Descripcion: string;
  Precio: number;
  Stock: number;
  Rubro: string;
  Marca: string;
  SubRubro?: string;
  CodigoBarras?: string;
}

export interface SistelCuenta {
  CodCliente?: string;
  CUIT: string;
  RazonSocial: string;
  Saldo?: number;
  DeudaTotal?: number;
  LimiteCredito: number;
  Estado: string;
}

export interface SistelDealItem {
  cod_articulo: string;
  cantidad: number;
  precio: number;
  descuento?: number;
}

export interface SistelDeal {
  fecha: string;
  cod_cliente: string;
  tipo_comprobante: string;
  obs?: string;
  items: SistelDealItem[];
}
