using Xunit;
using FluentAssertions;
using Fines.Api.Services;
using Fines.Api.DTOs;
using System.Linq;
using System.Threading;

namespace Fines.Api.Tests.Services
{
    public class NotificationServiceTests
    {
        [Fact]
        public void AddNotification_ShouldStoreNotification_ForValidMemberId()
        {
            // Arrange
            var service = new NotificationService();
            int memberId = 42;
            string message = "Test notification";

            // Act
            service.AddNotification(memberId, message);
            var notifications = service.GetNotificationsForMember(memberId).ToList();

            // Assert
            notifications.Should().HaveCount(1);
            notifications[0].Message.Should().Be(message);
            notifications[0].Timestamp.Should().BeAfter(System.DateTimeOffset.UtcNow.AddMinutes(-1));
        }

        [Fact]
        public void AddNotification_ShouldNotStoreNotification_ForNegativeMemberId()
        {
            // Arrange
            var service = new NotificationService();
            int memberId = -1;
            string message = "Should not be stored";

            // Act
            service.AddNotification(memberId, message);
            var notifications = service.GetNotificationsForMember(memberId);

            // Assert
            notifications.Should().BeEmpty();
        }

        [Fact]
        public void GetNotificationsForMember_ShouldReturnNotificationsInDescendingOrder()
        {
            // Arrange
            var service = new NotificationService();
            int memberId = 7;
            service.AddNotification(memberId, "First");
            Thread.Sleep(10); // Ensure different timestamps
            service.AddNotification(memberId, "Second");

            // Act
            var notifications = service.GetNotificationsForMember(memberId).ToList();

            // Assert
            notifications.Should().HaveCount(2);
            notifications[0].Message.Should().Be("Second");
            notifications[1].Message.Should().Be("First");
            notifications[0].Timestamp.Should().BeAfter(notifications[1].Timestamp);
        }

        [Fact]
        public void GetNotificationsForMember_ShouldReturnEmpty_IfNoNotifications()
        {
            // Arrange
            var service = new NotificationService();
            int memberId = 99;

            // Act
            var notifications = service.GetNotificationsForMember(memberId);

            // Assert
            notifications.Should().BeEmpty();
        }
    }
}