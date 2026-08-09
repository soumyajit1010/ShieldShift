package com.gigshield.backend.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CurfewRequest {

    private MultipartFile image;

}