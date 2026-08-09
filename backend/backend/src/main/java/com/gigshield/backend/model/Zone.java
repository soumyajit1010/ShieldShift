package com.gigshield.backend.model;

import jakarta.persistence.*;
import lombok.Data;




@Entity
@Table(
        name = "zone",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_zone_name",
                        columnNames = "name"
                )
        }
)
@Data
public class Zone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    /*
     * Zone/city name
     */
    private String name;


    /*
     * Geographic coordinates
     *
     * Required by:
     *
     * Weather API
     * AQI API
     */
    private double latitude;

    private double longitude;
}