import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Tabs, Tab, Form, Modal, InputGroup } from 'react-bootstrap';
import { Utensils, ShoppingBag, LogOut, Plus, Trash2, Edit3, CheckCircle, Clock, ChefHat, FolderPlus, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

const DashboardAdmin = ({ onLogout }) => {
    const [key, setKey] = useState('menu');
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [ordenes, setOrdenes] = useState([]);

    // Estados para modales de productos
    const [showModalProducto, setShowModalProducto] = useState(false);
    const [modoEdicionProducto, setModoEdicionProducto] = useState(false);
    const [productoIdEdicion, setProductoIdEdicion] = useState(null);

    // Estados para modales de categorías
    const [showModalCategoria, setShowModalCategoria] = useState(false);
    const [modoEdicionCategoria, setModoEdicionCategoria] = useState(false);
    const [categoriaIdEdicion, setCategoriaIdEdicion] = useState(null);

    // Estados para el formulario de producto
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevaDesc, setNuevaDesc] = useState('');
    const [nuevoPrecio, setNuevoPrecio] = useState('');
    const [categoriaIdSeleccionada, setCategoriaIdSeleccionada] = useState('');
    const [imagenUrl, setImagenUrl] = useState(''); // Nuevo estado para la imagen

    // Estado para el formulario de categoría
    const [nuevaCatNombre, setNuevaCatNombre] = useState('');

    // Cargar datos al montar el componente
    useEffect(() => {
        cargarDatosAdmin();
    }, []);

    const cargarDatosAdmin = async () => {
        try {
            const resMenu = await api.get('/menu-admin/products');
            setProductos(resMenu.data || []);

            const resCat = await api.get('/menu-admin/categories');
            setCategorias(resCat.data || []);

            const resOrdenes = await api.get('/admin/orders');
            setOrdenes(resOrdenes.data.ordenes || [
                { id: 101, cliente: "Carlos Pérez", total: 7.94, estado: "Pendiente", items: "Gourmet Egg Sandwich x2" },
                { id: 102, cliente: "Ana Gómez", total: 4.25, estado: "En preparación", items: "Corn Benedict x1" }
            ]);
        } catch (err) {
            console.error("Error al cargar datos administrativos:", err);
        }
    };

    // Manejar la conversión de la imagen seleccionada a Base64 para enviarla a la API
    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenUrl(reader.result); // Guarda la imagen en formato Base64
            };
            reader.readAsDataURL(file);
        }
    };

    // --- CRUD CATEGORÍAS ---
    const handleGuardarCategoria = async (e) => {
        e.preventDefault();
        if (!nuevaCatNombre.trim()) return;

        try {
            if (modoEdicionCategoria) {
                await api.put(`/menu-admin/categories/${categoriaIdEdicion}`, {
                    nombre: nuevaCatNombre
                });
            } else {
                await api.post('/menu-admin/categories', {
                    nombre: nuevaCatNombre,
                    orden: categorias.length + 1
                });
            }
            setNuevaCatNombre('');
            setModoEdicionCategoria(false);
            setCategoriaIdEdicion(null);
            setShowModalCategoria(false);
            cargarDatosAdmin();
        } catch (err) {
            alert("No se pudo guardar la categoría");
        }
    };

    const abrirModalEditarCategoria = (cat) => {
        setModoEdicionCategoria(true);
        setCategoriaIdEdicion(cat.id);
        setNuevaCatNombre(cat.nombre);
        setShowModalCategoria(true);
    };

    const handleEliminarCategoria = async (idCat) => {
        if (!window.confirm("¿Estás seguro? Al eliminar la categoría se eliminarán también sus productos asociados.")) return;
        try {
            await api.delete(`/menu-admin/categories/${idCat}`);
            cargarDatosAdmin();
        } catch (err) {
            alert("No se pudo eliminar la categoría");
        }
    };

    // --- CRUD PRODUCTOS ---
    const abrirModalCrearProducto = () => {
        setModoEdicionProducto(false);
        setProductoIdEdicion(null);
        setNuevoNombre('');
        setNuevaDesc('');
        setNuevoPrecio('');
        setCategoriaIdSeleccionada('');
        setImagenUrl('');
        setShowModalProducto(true);
    };

    const abrirModalEditarProducto = (prod) => {
        setModoEdicionProducto(true);
        setProductoIdEdicion(prod.id);
        setNuevoNombre(prod.nombre);
        setNuevaDesc(prod.descripcion || '');
        setNuevoPrecio(prod.precio);
        setCategoriaIdSeleccionada(prod.categoria_id);
        setImagenUrl(prod.imagen_url || '');
        setShowModalProducto(true);
    };

    const handleGuardarProducto = async (e) => {
        e.preventDefault();
        if (!categoriaIdSeleccionada) {
            alert("Por favor selecciona una categoría válida");
            return;
        }

        try {
            const payload = {
                nombre: nuevoNombre,
                descripcion: nuevaDesc,
                precio: parseFloat(nuevoPrecio),
                categoria_id: parseInt(categoriaIdSeleccionada),
                imagen_url: imagenUrl // Enviamos la imagen (URL o Base64)
            };

            if (modoEdicionProducto) {
                await api.put(`/menu-admin/products/${productoIdEdicion}`, payload);
            } else {
                await api.post('/menu-admin/products', payload);
            }

            setShowModalProducto(false);
            cargarDatosAdmin();
        } catch (err) {
            alert(err.response?.data?.error || "Error al guardar el producto");
        }
    };

    const handleEliminarProducto = async (idProducto) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este plato?")) return;
        try {
            await api.delete(`/menu-admin/products/${idProducto}`);
            cargarDatosAdmin();
        } catch (err) {
            alert("No se pudo eliminar el producto");
        }
    };

    const cambiarEstadoOrden = async (idOrden, nuevoEstado) => {
        try {
            await api.put(`/admin/orders/${idOrden}/status`, { estado: nuevoEstado });
            cargarDatosAdmin();
        } catch (err) {
            alert("No se pudo actualizar el estado de la orden");
        }
    };

    return (
        <div className="bg-light min-vh-100 pb-5">

            {/* NAVBAR DE ADMINISTRACIÓN */}
            <div className="bg-white border-bottom shadow-sm px-4 py-3 d-flex justify-content-between align-items-center sticky-top">
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-dark text-white rounded-3 p-2 d-flex align-items-center justify-content-center">
                        <ChefHat size={20} />
                    </div>
                    <div>
                        <h5 className="fw-bold m-0 text-dark">EasyCart Dashboard</h5>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Panel de Control B2B</span>
                    </div>
                </div>

                <Button
                    variant="light"
                    className="rounded-pill px-3 py-1.5 text-danger border d-flex align-items-center gap-2 small fw-semibold"
                    onClick={onLogout}
                >
                    <LogOut size={16} /> Cerrar Sesión
                </Button>
            </div>

            {/* CONTENIDO PRINCIPAL CON PESTAÑAS */}
            <Container className="py-4" style={{ maxWidth: '900px' }}>
                <Tabs
                    id="admin-tabs"
                    activeKey={key}
                    onSelect={(k) => setKey(k)}
                    className="mb-4 border-0 gap-2"
                >
                    {/* PESTAÑA 1: GESTIÓN DE MENÚ */}
                    <Tab eventKey="menu" title={
                        <span className="d-flex align-items-center gap-2 py-1 px-2 fw-semibold">
                            <Utensils size={16} /> Menú y Platos
                        </span>
                    }>
                        
                        {/* SECCIÓN RÁPIDA PARA CREAR CATEGORÍAS */}
                        <Card className="border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
                            <h6 className="fw-bold text-dark mb-2 small">Agregar Nueva Categoría</h6>
                            <Form onSubmit={(e) => {
                                e.preventDefault();
                                if (!nuevaCatNombre.trim()) return;
                                api.post('/menu-admin/categories', { nombre: nuevaCatNombre, orden: categorias.length + 1 })
                                   .then(res => {
                                       setCategorias([...categorias, res.data]);
                                       setNuevaCatNombre('');
                                   })
                                   .catch(() => alert("No se pudo crear la categoría"));
                            }}>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ej. Platos Principales, Bebidas..."
                                        value={nuevaCatNombre}
                                        onChange={(e) => setNuevaCatNombre(e.target.value)}
                                        className="bg-light border-0 rounded-start-pill py-2 ps-3 shadow-none small"
                                    />
                                    <Button 
                                        type="submit" 
                                        className="rounded-end-pill px-3 bg-dark border-0 d-flex align-items-center justify-content-center shadow-none"
                                        title="Crear Categoría"
                                    >
                                        <FolderPlus size={18} />
                                    </Button>
                                </InputGroup>
                            </Form>
                        </Card>

                        {/* LISTADO DE CATEGORÍAS */}
                        <Card className="border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
                            <h6 className="fw-bold text-dark mb-3 small">Categorías Existentes</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {categorias.length === 0 ? (
                                    <span className="text-muted small">No hay categorías creadas todavía.</span>
                                ) : (
                                    categorias.map((cat) => (
                                        <div key={cat.id} className="border rounded-pill px-3 py-1 bg-light d-flex align-items-center gap-2">
                                            <span className="small fw-semibold text-dark">{cat.nombre}</span>
                                            <div className="d-flex align-items-center gap-1">
                                                <button 
                                                    className="btn btn-link p-0 text-secondary text-decoration-none"
                                                    onClick={() => abrirModalEditarCategoria(cat)}
                                                    title="Editar categoría"
                                                >
                                                    <Edit3 size={12} />
                                                </button>
                                                <button 
                                                    className="btn btn-link p-0 text-danger text-decoration-none"
                                                    onClick={() => handleEliminarCategoria(cat.id)}
                                                    title="Eliminar categoría"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        {/* SECCIÓN DE PRODUCTOS */}
                        <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h5 className="fw-bold m-0">Gestión de tu Menú</h5>
                                    <p className="text-muted small m-0">Administra los productos visibles en tu carta digital</p>
                                </div>
                                <Button
                                    className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm border-0 text-white"
                                    style={{ width: '42px', height: '42px', backgroundColor: '#111111' }}
                                    onClick={abrirModalCrearProducto}
                                    title="Nuevo Plato"
                                >
                                    <Plus size={20} />
                                </Button>
                            </div>

                            <Table hover responsive className="align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="border-0 rounded-start-3 ps-3">Plato</th>
                                        <th className="border-0">Descripción</th>
                                        <th className="border-0">Precio</th>
                                        <th className="border-0 text-end rounded-end-3 pe-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center text-muted py-4 small">
                                                Aún no hay productos registrados. Haz clic en el botón <strong>+</strong> para agregar el primero.
                                            </td>
                                        </tr>
                                    ) : (
                                        productos.map((prod) => (
                                            <tr key={prod.id}>
                                                <td className="ps-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        {prod.imagen_url ? (
                                                            <img src={prod.imagen_url} alt={prod.nombre} className="rounded-3" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div className="bg-light rounded-3 d-flex align-items-center justify-content-center text-muted" style={{ width: '40px', height: '40px' }}>
                                                                <ImageIcon size={18} />
                                                            </div>
                                                        )}
                                                        <span className="fw-semibold">{prod.nombre}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-muted small text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                                                        {prod.descripcion || 'Sin descripción'}
                                                    </span>
                                                </td>
                                                <td className="fw-bold">${Number(prod.precio).toFixed(2)}</td>
                                                <td className="text-end pe-3">
                                                    <div className="d-flex justify-content-end gap-1">
                                                        <Button 
                                                            variant="light" 
                                                            className="text-secondary p-2 rounded-circle border-0 shadow-none"
                                                            onClick={() => abrirModalEditarProducto(prod)}
                                                            title="Editar plato"
                                                        >
                                                            <Edit3 size={16} />
                                                        </Button>
                                                        <Button 
                                                            variant="light" 
                                                            className="text-danger p-2 rounded-circle border-0 shadow-none"
                                                            onClick={() => handleEliminarProducto(prod.id)}
                                                            title="Eliminar plato"
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card>
                    </Tab>

                    {/* PESTAÑA 2: MONITOREO DE ÓRDENES */}
                    <Tab eventKey="orders" title={
                        <span className="d-flex align-items-center gap-2 py-1 px-2 fw-semibold">
                            <ShoppingBag size={16} /> Órdenes en Vivo
                        </span>
                    }>
                        <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
                            <div className="mb-4">
                                <h5 className="fw-bold m-0">Monitoreo de Pedidos</h5>
                                <p className="text-muted small m-0">Controla el estado de las órdenes enviadas por los clientes</p>
                            </div>

                            <Row className="g-3">
                                {ordenes.map((ord) => (
                                    <Col xs={12} key={ord.id}>
                                        <div className="border border-light rounded-4 p-3 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 bg-white">
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="fw-bold text-dark">Orden #{ord.id}</span>
                                                    <Badge bg={ord.estado === 'Pendiente' ? 'warning' : 'success'} className="rounded-pill px-2">
                                                        {ord.estado}
                                                    </Badge>
                                                </div>
                                                <p className="text-muted small mb-1">Cliente: <strong>{ord.cliente}</strong></p>
                                                <p className="small text-secondary mb-0">Items: {ord.items}</p>
                                            </div>

                                            <div className="d-flex align-items-center gap-3 justify-content-between justify-content-md-end border-top border-md-top-0 pt-2 pt-md-0">
                                                <span className="fw-bold fs-5 text-dark">${ord.total.toFixed(2)}</span>

                                                <div className="d-flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline-secondary"
                                                        className="rounded-pill px-3"
                                                        onClick={() => cambiarEstadoOrden(ord.id, 'En preparación')}
                                                    >
                                                        <Clock size={14} /> Preparar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="dark"
                                                        className="rounded-pill px-3 bg-dark border-0"
                                                        onClick={() => cambiarEstadoOrden(ord.id, 'Entregado')}
                                                    >
                                                        <CheckCircle size={14} /> Entregar
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card>
                    </Tab>
                </Tabs>
            </Container>

            {/* MODAL PARA EDITAR CATEGORÍA */}
            <Modal show={showModalCategoria} onHide={() => setShowModalCategoria(false)} centered contentClassName="border-0 rounded-4 shadow-lg">
                <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
                    <Modal.Title className="fw-bold fs-5">Editar Categoría</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleGuardarCategoria}>
                    <Modal.Body className="px-4 py-3">
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-semibold text-muted">Nombre de la categoría</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej. Platos Principales"
                                value={nuevaCatNombre}
                                onChange={(e) => setNuevaCatNombre(e.target.value)}
                                required
                                className="bg-light border-0 rounded-3 py-2 shadow-none"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 px-4 pb-4 pt-0">
                        <Button variant="light" className="rounded-pill px-4 border" onClick={() => setShowModalCategoria(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="dark" className="rounded-pill px-4 bg-dark border-0">
                            Actualizar
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* MODAL PARA CREAR/EDITAR PRODUCTO (CON SUBIDA DE FOTO) */}
            <Modal show={showModalProducto} onHide={() => setShowModalProducto(false)} centered contentClassName="border-0 rounded-4 shadow-lg">
                <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
                    <Modal.Title className="fw-bold fs-5">
                        {modoEdicionProducto ? 'Editar Plato' : 'Agregar Nuevo Plato'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleGuardarProducto}>
                    <Modal.Body className="px-4 py-3">
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-semibold text-muted">Nombre del plato</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej. Hamburguesa Doble"
                                value={nuevoNombre}
                                onChange={(e) => setNuevoNombre(e.target.value)}
                                required
                                className="bg-light border-0 rounded-3 py-2 shadow-none"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-semibold text-muted">Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Ingredientes y detalles..."
                                value={nuevaDesc}
                                onChange={(e) => setNuevaDesc(e.target.value)}
                                className="bg-light border-0 rounded-3 py-2 shadow-none"
                            />
                        </Form.Group>

                        {/* NUEVO CAMPO PARA FOTO DEL PRODUCTO (MÓVIL Y PC) */}
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-semibold text-muted">Foto del plato</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                capture="environment" 
                                onChange={handleImagenChange}
                                className="bg-light border-0 rounded-3 py-2 shadow-none small"
                            />
                            {imagenUrl && (
                                <div className="mt-2 d-flex align-items-center gap-2">
                                    <img src={imagenUrl} alt="Vista previa" className="rounded-3 border" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Imagen cargada correctamente</span>
                                </div>
                            )}
                        </Form.Group>

                        <Row>
                            <Col xs={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold text-muted">Precio ($)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        placeholder="4.99"
                                        value={nuevoPrecio}
                                        onChange={(e) => setNuevoPrecio(e.target.value)}
                                        required
                                        className="bg-light border-0 rounded-3 py-2 shadow-none"
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold text-muted">Categoría</Form.Label>
                                    <Form.Select
                                        value={categoriaIdSeleccionada}
                                        onChange={(e) => setCategoriaIdSeleccionada(e.target.value)}
                                        required
                                        className="bg-light border-0 rounded-3 py-2 shadow-none"
                                    >
                                        <option value="">Selecciona...</option>
                                        {categorias.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.nombre}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        {categorias.length === 0 && (
                            <div className="text-danger small mt-1">
                                * Crea una categoría primero antes de asociar productos.
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="border-0 px-4 pb-4 pt-0">
                        <Button variant="light" className="rounded-pill px-4 border" onClick={() => setShowModalProducto(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="dark" className="rounded-pill px-4 bg-dark border-0">
                            {modoEdicionProducto ? 'Actualizar Plato' : 'Guardar Plato'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

        </div>
    );
};

export default DashboardAdmin;