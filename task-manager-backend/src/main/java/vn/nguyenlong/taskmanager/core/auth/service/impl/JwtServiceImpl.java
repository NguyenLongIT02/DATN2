package vn.nguyenlong.taskmanager.core.auth.service.impl;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import vn.nguyenlong.taskmanager.core.auth.entity.Token;
import vn.nguyenlong.taskmanager.core.auth.enums.TokenType;
import vn.nguyenlong.taskmanager.core.auth.repository.TokenRepository;
import vn.nguyenlong.taskmanager.core.auth.service.JwtService;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

import static vn.nguyenlong.taskmanager.core.auth.enums.TokenType.ACCESS_TOKEN;
import static vn.nguyenlong.taskmanager.core.auth.enums.TokenType.REFRESH_TOKEN;

@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {

    private final TokenRepository tokenRepository;

    @Value("${jwt.expiration}")
    private long expirationTime;

    @Value("${jwt.expiration-refresh-token}")
    private long expirationRefreshTokenTime;

    @Value("${jwt.secretKey}")
    private String secretKey;

    @Value("${jwt.refreshKey}")
    private String refreshKey;

    @Override
    public String generateToken(UserDetails user) {
        return generateToken(new HashMap<>(), user);
    }

    @Override
    public String generateRefreshToken(UserDetails user, String refreshTokenUuid) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("rid", refreshTokenUuid);
        return generateRefreshToken(claims, user);
    }

    @Override
    public String extractUsername(String token, TokenType type) {
        return extractClaim(token, type, Claims::getSubject);
    }

    @Override
    public boolean isValidToken(String token, TokenType type, UserDetails user) {
        final String username = extractUsername(token, type);
        return (username.equals(user.getUsername()) && !isTokenExpired(token, type));
    }

    @Override
    public boolean validateRefreshToken(String token) {
        Claims claims = extractAllClaim(token, REFRESH_TOKEN);
        String refreshTokenUuid = claims.get("rid", String.class);
        Optional<Token> authToken = tokenRepository.findByRefreshTokenUuid(refreshTokenUuid);
        if (authToken.isEmpty()) return false;

        Token existingToken = authToken.get();
        return !existingToken.isRevoked()
               && !existingToken.isExpired()
               && existingToken.getUser().isEnabled()
               && !isTokenExpired(token, REFRESH_TOKEN);
    }

    private Key getKey(TokenType type) {
        byte[] keyBytes;
        if (ACCESS_TOKEN.equals(type)) {
            keyBytes = Decoders.BASE64.decode(secretKey);
        } else keyBytes = Decoders.BASE64.decode(refreshKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private <T> T extractClaim(String token, TokenType type, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaim(token, type);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaim(String token, TokenType type) {
        return Jwts.parserBuilder().setSigningKey(getKey(type)).build().parseClaimsJws(token).getBody();
    }

    private boolean isTokenExpired(String token, TokenType type) {
        return extractExpiration(token, type).before(new Date());
    }

    private Date extractExpiration(String token, TokenType type) {
        return extractClaim(token, type, Claims::getExpiration);
    }

    private String generateToken(Map<String, Object> claims, UserDetails user) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getKey(ACCESS_TOKEN), SignatureAlgorithm.HS512)
                .compact();
    }

    private String generateRefreshToken(Map<String, Object> claims, UserDetails user) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationRefreshTokenTime))
                .signWith(getKey(REFRESH_TOKEN), SignatureAlgorithm.HS512)
                .compact();
    }
}
