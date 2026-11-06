package com.example.digital_fit.service.CentroPrivado;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.example.digital_fit.dto.CentroPrivado.CentroPrivadoBaseDTO;
import com.example.digital_fit.model.CentroPrivado.CentroPrivadoBase;

class CentroPrivadoBaseServiceTest {

    private CentroPrivadoBaseService service;

    @BeforeEach
    void setUp() {
        service = new CentroPrivadoBaseService();
    }

    @Test
    void testEntityToDtoConOsmId() {
        CentroPrivadoBase entity = CentroPrivadoBase.builder()
                .id(10L)
                .osmId(987654L)
                .nombre("Gym Fitness Central")
                .direccion("Av. del Cid, 20")
                .telefono("961234567")
                .horario("07:00-23:00")
                .precioMensual(39.99)
                .latitud(39.470)
                .longitud(-0.380)
                .build();

        CentroPrivadoBaseDTO dto = service.entityToDto(entity);

        assertNotNull(dto);
        assertEquals(10L, dto.getId());
        assertEquals(987654L, dto.getOsmId());
        assertEquals("Gym Fitness Central", dto.getNombre());
        assertEquals(39.99, dto.getPrecioMensual());
    }

    @Test
    void testDtoToEntityConOsmId() {
        CentroPrivadoBaseDTO dto = new CentroPrivadoBaseDTO();
        dto.setId(10L);
        dto.setOsmId(987654L);
        dto.setNombre("Gym Fitness Central");
        dto.setDireccion("Av. del Cid, 20");
        dto.setTelefono("961234567");
        dto.setHorario("07:00-23:00");
        dto.setPrecioMensual(39.99);
        dto.setLatitud(39.470);
        dto.setLongitud(-0.380);

        CentroPrivadoBase entity = service.dtoToEntity(dto);

        assertNotNull(entity);
        assertEquals(10L, entity.getId());
        assertEquals(987654L, entity.getOsmId());
        assertEquals("Gym Fitness Central", entity.getNombre());
    }
}
