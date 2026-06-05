package com.honeypot.api.repository;

import com.honeypot.api.model.Ataque;
import com.honeypot.api.model.TipoAtaque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AtaqueRepository extends JpaRepository<Ataque, Long> {

  List<Ataque> findAllByOrderByTimestampDesc();

  List<Ataque> findByTipo(TipoAtaque tipo);

  long count();

  @Query("SELECT a.ip, COUNT(a) FROM Ataque a GROUP BY a.ip ORDER BY COUNT(a) DESC")
  List<Object[]> contarPorIp();

  @Query("SELECT a.tipo, COUNT(a) FROM Ataque a GROUP BY a.tipo ORDER BY COUNT(a) DESC")
  List<Object[]> contarPorTipo();

  @Query("SELECT a.endpoint, COUNT(a) FROM Ataque a GROUP BY a.endpoint ORDER BY COUNT(a) DESC")
  List<Object[]> contarPorEndpoint();
}
