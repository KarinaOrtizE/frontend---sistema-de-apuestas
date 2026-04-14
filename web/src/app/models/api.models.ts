export enum EstadoApuesta {
    PENDIENTE = "pendiente",
    GANADA = "ganada",
    PERDIDA = "perdida",
}

export enum TipoTransaccion {
    DEPOSITO = "deposito",
    RETIRO = "retiro",
    APUESTA = "apuesta",
    PREMIO = "premio"
}

type UUID = string;
type Decimal = number;

export interface ApuestaCreate {
    id_usuario: UUID;
    id_sorteo: UUID;
    monto_apostado: number;
    estado: EstadoApuesta; 
    id_usuario_creacion: UUID;
}

export interface ApuestaUpdate {
    id_usuario?: UUID | null;
    id_sorteo?: UUID | null;
    monto_apostado?: number | null;
    estado?: EstadoApuesta | null;
    id_usuario_edita: UUID;
}

export interface ApuestaRead {
    id_apuesta: UUID;
    id_usuario: UUID;
    id_sorteo: UUID;
    monto_apostado: number;
    estado: EstadoApuesta;
    fecha_creacion: Date;
    fecha_edicion?: Date | null;
    id_usuario_creacion: UUID;
    id_usuario_edita?: UUID | null;
}

export interface BilleteraCreate {
    id_usuario: UUID;
    saldo: Decimal;
    id_usuario_creacion: UUID;
}

export interface BilleteraUpdate {
    id_usuario?: UUID | null;
    saldo?: Decimal | null;
    id_usuario_edita: UUID;
}

export interface BilleteraRecarga {
    monto: Decimal;
    id_usuario_edita: UUID;
}

export interface BilleteraRead {
    id_billetera: UUID;
    id_usuario: UUID;
    saldo: Decimal;
    fecha_creacion: Date;
    fecha_edicion?: Date | null;
    id_usuario_creacion: UUID;
    id_usuario_edita?: UUID | null;
}

export interface BingoCreate {
    aciertos: number;
    costo_entrada: number;
    recompensa: number;
}

export interface BingoUpdate {
    aciertos?: number | null;
    costo_entrada?: number | null;
    recompensa?: number | null;
}

export interface BingoRead {
    id_bingo: UUID;
    aciertos: number;
    costo_entrada: number;
    recompensa: number;
}

export interface LoteriaCreate {
    numero_jugado: string;
    costo_entrada: number;
    recompensa: number;
}

export interface LoteriaUpdate {
    numero_jugado?: string | null;
    costo_entrada?: number | null;
    recompensa?: number | null;
}

export interface LoteriaRead {
    id_loteria: UUID;
    numero_jugado: string;
    costo_entrada: number;
    recompensa: number;
}

export interface MetodoPagoCreate {
    tipo_metodo: string;
    nombre_titular: string;
    id_usuario_dueno: UUID;
}

export interface MetodoPagoUpdate {
    tipo_metodo?: string | null;
    nombre_titular?: string | null;
    id_usuario_edita: UUID;
}

export interface MetodoPagoRead {
    id_metodo_pago: UUID;
    tipo_metodo: string;
    nombre_titular: string;
    id_usuario_dueno: UUID;
    fecha_creacion: Date;
    fecha_edicion?: Date | null;
    id_usuario_edita?: UUID | null;
}

export interface EleccionRuleta {
    numero?: number | null;
    color?: string | null;
    paridad?: string | null;
    rango?: string | null;
}

export interface RuletaCreate {
    eleccion_usuario: EleccionRuleta;
    costo_entrada: number;
    recompensa: number;
}

export interface RuletaUpdate {
    eleccion_usuario?: EleccionRuleta | null;
    costo_entrada?: number | null;
    recompensa?: number | null;
}

export interface RuletaRead {
    id_ruleta: UUID;
    eleccion_usuario: Record<string, any>;
    costo_entrada: number;
    recompensa: number;
}

export interface SorteoCreate {
    fecha_sorteo: Date;
    id_bingo?: UUID | null;
    id_ruleta?: UUID | null;
    id_loteria?: UUID | null;
}

export interface SorteoUpdate {
    fecha_sorteo?: Date | null;
    resultado?: Record<string, any> | null;
    id_bingo?: UUID | null;
    id_ruleta?: UUID | null;
    id_loteria?: UUID | null;
}

export interface SorteoRead {
    id_sorteo: UUID;
    fecha_sorteo: Date;
    resultado?: Record<string, any> | null;
    id_bingo?: UUID | null;
    id_ruleta?: UUID | null;
    id_loteria?: UUID | null;
}

export interface TransaccionCreate {
    tipo: TipoTransaccion; 
    monto: number;
    id_billetera: UUID;
    id_metodo_pago: UUID;
}

export interface TransaccionUpdate {
    tipo?: TipoTransaccion | null;
    monto?: number | null;
    id_billetera?: UUID | null;
    id_metodo_pago?: UUID | null;
}

export interface TransaccionRead {
    id_transaccion: UUID;
    tipo: TipoTransaccion;
    monto: number;
    id_billetera: UUID;
    id_metodo_pago: UUID;
}

export interface UsuarioCreate {
    nombre: string;
    username: string;
    email: string;
    password: string;
    rol: string;
    fecha_nac?: Date | null;
}

export interface UsuarioUpdate {
    nombre?: string | null;
    username?: string | null;
    password?: string | null;
    rol?: string | null;
    activo?: boolean | null;
}

export interface UsuarioRead {
    id_usuario: UUID;
    nombre: string;
    username: string;
    email: string;
    rol: string;
    activo: boolean;
}