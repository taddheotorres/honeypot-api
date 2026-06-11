package com.honeypot.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {

  @Value("${honeypot.rate-limit.max:10}")
  private int maxRequests;

  @Value("${honeypot.rate-limit.window-seconds:60}")
  private int windowSeconds;

  @Bean
  public RateLimitingFilter rateLimitingFilter() {
    return new RateLimitingFilter(maxRequests, windowSeconds);
  }

  @Bean
  public FilterRegistrationBean<RateLimitingFilter> rateLimitingFilterRegistration(RateLimitingFilter filter) {
    FilterRegistrationBean<RateLimitingFilter> registration = new FilterRegistrationBean<>(filter);
    registration.setOrder(1);
    return registration;
  }
}
