package com.example.digital_fit.service.LugarPublico;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.example.digital_fit.dto.LugarPublico.LugarPublicoBaseDTO;
import com.example.digital_fit.model.Enums.TipoLugarPublico;
import com.example.digital_fit.model.LugarPublico.LugarPublicoBase;

class LugarPublicoBaseServiceTest {

    private LugarPublicoBaseService service;

    @BeforeEach
    void setUp() {
        service = new LugarPublicoBaseService();
    }

    @Test
    void testEntityToDtoConOsmId() {
        LugarPublicoBase entity = LugarPublicoBase.builder()
                .id(20L)
                .osmId(112233L)
                .nombre("Parque de Calistenia Cabanyal")
                .direccion("Paseo Maritimo, Valencia")
                .latitud(39.467)
                .longitud(-0.325)
                .tipo(TipoLugarPublico.PARQUE_CALISTENIA)
                .descripcion("Barras y paralelas frente a la playa")
                .build();

        LugarPublicoBaseDTO dto = service.entityToDto(entity);

        assertNotNull(dto);
        assertEquals(20L, dto.getId());
        assertEquals(112233L, dto.getOsmId());
        assertEquals("Parque de Calistenia Cabanyal", dto.getNombre());
        assertEquals(TipoLugarPublico.PARQUE_CALISTENIA, dto.getTipo());
    }

    @Test
    void testDtoToEntityConOsmId() {
        LugarPublicoBaseDTO dto = new LugarPublicoBaseDTO();
        dto.setId(20L);
        dto.setOsmId(112233L);
        dto.setNombre("Parque de Calistenia Cabanyal");
        dto.setDireccion("Paseo Maritimo, Valencia");
        dto.setLatitud(39.467);
        dto.setLongitud(-0.325);
        dto.setTipo(TipoLugarPublico.PARQUE_CALISTENIA);
        dto.setDescripcion("Barras y paralelas");

        LugarPublicoBase entity = service.dtoToEntity(dto);

        assertNotNull(entity);
        assertEquals(20L, entity.getId());
        assertEquals(112233L, entity.getOsmId());
        assertEquals("Parque de Calistenia Cabanyal", entity.getNombre());
    }
}
