package com.voiceshield.ai.service;

import com.voiceshield.ai.dto.auth.AuthResponse;
import com.voiceshield.ai.dto.auth.LoginRequest;
import com.voiceshield.ai.dto.auth.RegisterRequest;
import com.voiceshield.ai.entity.Role;
import com.voiceshield.ai.entity.User;
import com.voiceshield.ai.entity.enums.RoleType;
import com.voiceshield.ai.repository.RoleRepository;
import com.voiceshield.ai.repository.UserRepository;
import com.voiceshield.ai.security.JwtTokenProvider;
import com.voiceshield.ai.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            AuditService auditService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFirstName(),
                request.getLastName()
        );
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }

        Role userRole = roleRepository.findByName(RoleType.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_USER, "Standard User")));
        user.setRoles(Set.of(userRole));

        User saved = userRepository.save(user);

        auditService.logAction(saved, "USER_REGISTRATION", "USER", saved.getId().toString(), null, "SUCCESS", "User registered successfully");

        return authenticateAndGenerateToken(request.getUsername(), request.getPassword());
    }

    public AuthResponse login(LoginRequest request) {
        AuthResponse response = authenticateAndGenerateToken(request.getUsername(), request.getPassword());
        userRepository.findByUsername(request.getUsername()).ifPresent(user -> {
            auditService.logAction(user, "USER_LOGIN", "USER", user.getId().toString(), null, "SUCCESS", "Successful JWT authentication");
        });
        return response;
    }

    private AuthResponse authenticateAndGenerateToken(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new AuthResponse(jwt, principal.getId(), principal.getUsername(), principal.getEmail(), roles);
    }
}
