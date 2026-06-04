export enum UserType {
    ADMIN = 'admin',
    RECEPTIONIST = 'receptionist',
    DOCTOR = 'doctor',
    User = 'user',
}

export enum AppointmentStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
}

export enum DoctorSpeciality {
    GENERAL_PRACTICE = 'General Practice',
    CARDIOLOGY = 'Cardiology',
    DERMATOLOGY = 'Dermatology',
    NEUROLOGY = 'Neurology',
    ORTHOPEDICS = 'Orthopedics',
    PEDIATRICS = 'Pediatrics',
    OPHTHALMOLOGY = 'Ophthalmology',
    PSYCHIATRY = 'Psychiatry',
    GYNECOLOGY = 'Gynecology',
    UROLOGY = 'Urology',
    ENT = 'Ear, Nose & Throat',
    GASTROENTEROLOGY = 'Gastroenterology',
    ONCOLOGY = 'Oncology',
    ENDOCRINOLOGY = 'Endocrinology',
    PULMONOLOGY = 'Pulmonology',
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}
